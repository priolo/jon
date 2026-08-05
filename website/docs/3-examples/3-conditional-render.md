---
title: 'Conditional render'
sidebar_label: 'Conditional render'
sidebar_position: 3
---

# Conditional render

One store, several components — but each one should re-render **only when the data it cares about changes**. No selectors, no memoized slices: `useStore` takes an optional *predicate* `(state, old) => boolean` and re-renders only when it returns `true`.

```tsx
import { createStore, useStore } from "@priolo/jon"

const userStore = createStore({

  state: {
    name: "Jon",
    count: 0,
  },

  mutators: {
    setName: (name: string) => ({ name }),
    setCount: (count: number) => ({ count }),
  },

})

// re-renders ONLY when `name` changes: incrementing count doesn't touch it
function NamePanel() {
  const { name } = useStore(userStore, (state, old) => state.name != old.name)
  return <p>name: {name}</p>
}

// re-renders ONLY when `count` changes
function CountPanel() {
  const { count } = useStore(userStore, (state, old) => state.count != old.count)
  return <p>count: {count}</p>
}

// no predicate: re-renders on EVERY store change
function AllPanel() {
  const { name, count } = useStore(userStore)
  return <p>name: {name} · count: {count}</p>
}

// the parent does NOT subscribe: each panel decides for itself
export default function App() {
  return (
    <div>
      <button onClick={() => userStore.setName("Arya")}>change name</button>
      <button onClick={() => userStore.setCount(userStore.state.count + 1)}>increment count</button>
      <NamePanel />
      <CountPanel />
      <AllPanel />
    </div>
  )
}
```

## What's going on

- The predicate isn't a selector: it doesn't pick data out, it just answers "should this component re-render?". You still get the whole state back.
- The parent renders the panels but doesn't call `useStore`, so clicking a button never re-renders the whole tree — only the panel whose predicate says yes.
- The runnable version adds a render counter to each panel so you can *see* who re-renders when.

:::caution The predicate must be pure
The predicate is bound **once**, when the component subscribes, and isn't re-read on later renders. So it must decide based only on its `state` / `oldState` arguments — don't close over props or other outside variables, or they'll go stale. `(state, old) => state.count != old.count` is fine; `(state) => state.count > props.threshold` is not.
:::

:::note Equality is by reference, not deep-equal
`jon` never deep-compares state (that would be O(n) on every mutation). A mutator that returns a **new** object or array which is *deeply equal* to the previous value is still treated as a change and will re-render. If you want to skip an update, return `undefined` from the mutator when nothing actually changed — the check stays cheap and stays in your hands.
:::

Full source: [src/examples/conditionalRender](https://github.com/priolo/jon/blob/master/src/examples/conditionalRender/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/snowy-hooks-5s996m)
