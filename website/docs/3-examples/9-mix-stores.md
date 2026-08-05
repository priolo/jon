---
title: 'Mix stores'
sidebar_label: 'Mix stores'
sidebar_position: 9
---

# Mix stores

`mixStores` merges two (or more) setup objects into one, ready for `createStore`. Think of it as **inheritance for stores**: you write a generic, reusable base setup — a sort of *abstract class* that doesn't know the concrete properties — and mix it with a setup that implements the real ones.

To make it concrete, let's rebuild the [Persist](/docs/examples/persist) example this way: a generic "persistent store" setup, mixed with the actual note store.

:::info full library required
`mixStores` and the `onStateChange` hook ship with the [installed package](/docs/import) — they're not in the copy-paste juice file.
:::

```tsx
import { createStore, useStore, mixStores, Store, StoreSetup } from "@priolo/jon"

const STORAGE_KEY = "my-app-state"

// generic setup: makes ANY setup it's mixed with persistent.
// It doesn't know which properties it's saving — like an abstract class.
function persistSetup(key: string): StoreSetup<any> {
  return {

    // at boot: read back the last saved state (or nothing, if there is none)
    state: () => {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : {}
    },

    // on every change: save
    onStateChange: (store) => {
      localStorage.setItem(key, JSON.stringify(store.state))
    },

  }
}

// concrete setup: the real properties and their logic
const noteSetup = {

  state: {
    text: "",
    count: 0,
  },

  actions: {
    reset: (_: void, store: Store) => {
      localStorage.removeItem(STORAGE_KEY)
      store.setText("")
      store.setCount(0)
    },
  },

  mutators: {
    setText: (text: string) => ({ text }),
    setCount: (count: number) => ({ count }),
  },

}

// the mix: order matters! On conflicts the LAST setup wins (like a subclass
// override): the state saved by persistSetup must win over noteSetup's defaults.
const noteStore: Store = createStore(mixStores(noteSetup, persistSetup(STORAGE_KEY))!)

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

- `mixStores(a, b, ...)` merges `state`, `getters`, `actions`, `mutators` and the lifecycle hooks of every setup. If both objects are plain state they're spread together; if either is a factory, the mix becomes a factory too.
- **Later setups override earlier ones**, exactly like a subclass overriding a method. That's why `persistSetup` goes last: its state factory (the saved state) must win over `noteSetup`'s defaults, and its `onStateChange` must be the one that runs.
- `persistSetup(key)` is a plain function returning a setup — so the "base class" is parameterizable and reusable: any store in the app becomes persistent by mixing it in with its own storage key.
- One trade-off: a mixed setup is heterogeneous, so the result is the permissive `Store` handle rather than a precisely-inferred type (same as sibling calls inside actions).
- Same trick works for splitting one big store across files, sharing a common `loading/error` block between stores, or overriding a single action of an existing setup.

Full source: [src/examples/mixStores](https://github.com/priolo/jon/blob/master/src/examples/mixStores/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/mix-stores-8n87qm)
