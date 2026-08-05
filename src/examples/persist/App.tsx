// jon · persistence on localStorage
// https://codesandbox.io/p/sandbox/persist-3qmy2r

import { Store } from "../../lib/store/global"
import { createStore, useStore } from "../../lib/store/rvx"

/**
 * localStorage persistence in three moves:
 * - `state` as a factory: on boot it reads back the last saved state
 * - `onStateChange`: saves the state on every change
 * - reload the page to verify
 *
 * Uses the full library (rvx.ts), NOT rvx_juice:
 * the juice file deliberately omits lifecycle hooks like `onStateChange`.
 */

const STORAGE_KEY = "jon-persist-example"

const initialState = { text: "", count: 0 }

const noteStore = createStore({

  // the factory is NOT cloned: it gets called and its result is used as-is
  state: (): typeof initialState => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialState
  },

  onStateChange: (store) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state))
  },

  actions: {
    reset: (_: void, store: Store) => {
      localStorage.removeItem(STORAGE_KEY)
      store.setText(initialState.text)
      store.setCount(initialState.count)
    },
  },

  mutators: {
    setText: (text: string) => ({ text }),
    setCount: (count: number) => ({ count }),
  },

})

export default function App() {

  const { text, count } = useStore(noteStore)

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>jon · persistence on localStorage</h1>

      <p>Type something, click +1, then <b>reload the page</b>: the status is still there.</p>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={e => noteStore.setText(e.target.value)} placeholder="a note..." />
        <button onClick={() => noteStore.setCount(count + 1)}>+1</button>
        <button onClick={() => noteStore.reset()}>reset</button>
      </div>

      <p>text: <code>{text || "(void)"}</code> · count: <code>{count}</code></p>
    </div>
  );
}
