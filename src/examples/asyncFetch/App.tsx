// Example of async action in jon
// https://codesandbox.io/p/sandbox/async-fetch-xnz982

import { createStore, Store, useStore } from "../../lib/store/rvx_juice"



const FAKE_USERS = ["Jon", "Arya", "Sansa", "Bran"]

/** fake API: responds after 800ms and occasionally fails, to show the error branch */
function fetchUsersApi(): Promise<string[]> {
  return new Promise((resolve, reject) => setTimeout(
    () => Math.random() < 0.3 ? reject(new Error("network error (simulated)")) : resolve(FAKE_USERS),
    800,
  ))
}

/**
 * The canonical pattern for async in jon:
 * - ACTIONS can be async: they call the API and orchestrate
 * - MUTATORS stay synchronous: they only apply state diffs
 */
const usersStore = createStore({

  state: {
    users: [] as string[],
    loading: false,
    error: null as string | null,
  },

  actions: {
    fetchUsers: async (_: void, store: Store) => {
      store.setLoading(true)
      try {
        const users = await fetchUsersApi()
        store.setUsers(users)
      } catch (e: any) {
        store.setError(e.message)
      }
    },
  },

  mutators: {
    setLoading: (loading: boolean) => ({ loading, error: null }),
    setUsers: (users: string[]) => ({ users, loading: false }),
    setError: (error: string) => ({ error, loading: false }),
  },

})

export default function App() {

  const { users, loading, error } = useStore(usersStore)

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>jon · async actions</h1>

      <div>
        <button onClick={() => usersStore.fetchUsers()} disabled={loading}>
          {loading ? "loading..." : "load users"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>error: {error} · try again</p>}

      <ul>
        {users.map((u: string) => <li key={u}>{u}</li>)}
      </ul>
    </div>
  );
}
