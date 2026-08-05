---
title: 'Persist'
sidebar_label: 'Persist'
sidebar_position: 8
---

# Persist

Save state to `localStorage` and get it back after a reload. Three moves: a **state factory** that reads the last saved state at boot, the **`onStateChange`** hook that saves on every change, and... that's it, there is no third move.

:::info full library required
This example uses `onStateChange`, a lifecycle hook that the copy-paste `rvx_juice.ts` deliberately leaves out. It's one of the extras you get by [installing the package](/docs/import).
:::

```tsx
import { createStore, useStore, Store } from "@priolo/jon"

const STORAGE_KEY = "my-app-state"

const initialState = { text: "", count: 0 }

const noteStore = createStore({

  // a factory is NOT cloned: it's called and its result used as-is.
  // At boot it reads the last saved state.
  state: (): typeof initialState => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialState
  },

  // on every state change, save
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
    <div>
      <input value={text} onChange={e => noteStore.setText(e.target.value)} />
      <button onClick={() => noteStore.setCount(count + 1)}>+1</button>
      <button onClick={() => noteStore.reset()}>reset</button>
      <p>text: {text} · count: {count}</p>
    </div>
  )
}
```

## What's going on

- `state` as a **function** means "call me for the initial state" — perfect for reading from storage. (A plain object would be deep-cloned instead.)
- `onStateChange` fires after every mutation, so whatever the user does, the latest state is already in `localStorage`. Type something, click +1, **reload the page**: it's all still there.
- Swap `localStorage` for `sessionStorage`, IndexedDB or an API call — the pattern doesn't change.
- Want to reuse this persistence logic across many stores? The [mix stores](/docs/examples/mix-stores) example extracts it into a generic, composable setup.

Full source: [src/examples/persist](https://github.com/priolo/jon/blob/master/src/examples/persist/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/persist-3qmy2r)
