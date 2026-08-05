---
title: 'Async fetch'
sidebar_label: 'Async fetch'
sidebar_position: 6
---

# Async fetch

Loading spinners, error branches, data — the bread and butter of every app. The canonical pattern in Jon: **actions can be async** and orchestrate the API call, **mutators stay synchronous** and only apply state diffs.

```tsx
import { createStore, useStore, Store } from "@priolo/jon"

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
        const res = await fetch("/api/users")
        store.setUsers(await res.json())
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
    <div>
      <button onClick={() => usersStore.fetchUsers()} disabled={loading}>
        {loading ? "loading..." : "load users"}
      </button>

      {error && <p>error: {error} · try again</p>}

      <ul>{users.map(u => <li key={u}>{u}</li>)}</ul>
    </div>
  )
}
```

## What's going on

- The async action is the *only* place where `await` happens. It flips `loading` on, calls the API, and hands the result (or the error) to a mutator.
- Each mutator settles a whole UI branch in one shallow merge: `setUsers` sets the data *and* turns loading off; `setError` records the error *and* turns loading off. No inconsistent in-between states.
- The component just reads the three slices and renders — it doesn't know or care that a fetch is going on.

Full source: [src/examples/asyncFetch](https://github.com/priolo/jon/blob/master/src/examples/asyncFetch/App.tsx) (with a fake API that randomly fails, so you can see the error branch)
