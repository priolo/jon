---
title: 'Store instances'
sidebar_label: 'Store instances'
sidebar_position: 2
---

# Store instances

A setup object is not a store — it's the **blueprint** of one, like a class. Every `createStore(setup)` call returns a fresh, fully independent **instance**: the state is deep-cloned on each call, so instances share nothing.

Which means you can spawn as many stores as you have components: here, an array of windows, each with its own store.

```tsx
import { useState } from "react"
import { createStore, useStore, Store, StoreOf } from "@priolo/jon"

// the "class": one setup describes a window
const windowSetup = {

  state: {
    title: "",
    minimized: false,
    count: 0,
  },

  actions: {
    toggle: (_: void, store: Store) => store.setMinimized(!store.state.minimized),
  },

  mutators: {
    setTitle: (title: string) => ({ title }),
    setMinimized: (minimized: boolean) => ({ minimized }),
    setCount: (count: number) => ({ count }),
  },

}

// the fully-inferred type of a store built from `windowSetup`: methods and
// state are typed for free — no `Store` cast, which would collapse them to `any`
type WindowStore = StoreOf<typeof windowSetup>

// the "new": create an instance and customize it
function createWindowStore(title: string): WindowStore {
  const store = createStore(windowSetup)
  store.setTitle(title)
  return store
}

// the component receives ITS instance via props:
// same code, different store, different state
function Window({ store, onClose }: { store: WindowStore, onClose: () => void }) {
  const { title, minimized, count } = useStore(store)

  return (
    <fieldset>
      <legend>
        <b>{title}</b>
        <button onClick={() => store.toggle()}>{minimized ? "▢" : "—"}</button>
        <button onClick={onClose}>✕</button>
      </legend>

      {!minimized && <div>
        <button onClick={() => store.setCount(count + 1)}>+1</button>
        count: {count}
      </div>}
    </fieldset>
  )
}

// the App owns the LIST of instances; each window's state lives in its store
let lastId = 0
const newWindow = () => ({ id: ++lastId, store: createWindowStore(`window ${lastId}`) })

export default function App() {
  const [windows, setWindows] = useState(() => [newWindow(), newWindow()])

  return (
    <div>
      <button onClick={() => setWindows(ws => [...ws, newWindow()])}>open a window</button>

      {windows.map(w =>
        <Window key={w.id} store={w.store}
          onClose={() => setWindows(ws => ws.filter(x => x.id != w.id))} />
      )}
    </div>
  )
}
```

## What's going on

- `createStore` deep-clones a plain `state` object (`structuredClone`) on every call — that's what makes instances independent. Click `+1` on one window and the others don't move.
- `createWindowStore` plays the role of the constructor: create the instance, customize it (`setTitle`), hand it out. Any parameterization you need goes here.
- The component doesn't import a global store: it gets its instance **via props**, so `Window` is reusable anywhere — including with two windows rendered side by side.
- Who owns what: the App owns the *list* (open/close is plain React state), each store owns its *window's* state. Global singletons and per-component instances are the same API — a store is just a value.

Full source: [src/examples/storeInstances](https://github.com/priolo/jon/blob/master/src/examples/storeInstances/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/instances-fmt7mn)
