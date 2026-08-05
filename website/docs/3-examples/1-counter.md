---
title: 'Counter'
sidebar_label: 'Counter'
sidebar_position: 1
---

# Counter

The hello world. One store, one component, the whole reactive loop in ~25 lines.

```tsx
import { createStore, useStore, Store } from "@priolo/jon"

const counterStore = createStore({

  state: {
    count: 0,
  },

  actions: {
    increment: (_: void, store: Store) => {
      store.setCount(store.state.count + 1)
    },
  },

  mutators: {
    setCount: (count: number) => ({ count }),
  },

})

export default function App() {
  // subscribe: every count change re-renders the component
  const { count } = useStore(counterStore)

  return (
    <div>
      <button onClick={() => counterStore.increment()}>increment</button>
      <p>count: {count}</p>
    </div>
  )
}
```

## What's going on

- `useStore(counterStore)` subscribes the component and returns the current state. When the state changes, the component re-renders. That's it.
- The **action** `increment` orchestrates: it reads the current state and calls a mutator. The `store` handle is its second argument — treat it like `this`.
- The **mutator** `setCount` is the only thing that changes state. It returns a *partial* state (`{ count }`) that gets shallow-merged into the store.
- You call methods directly on the store, passing only the payload: `counterStore.increment()`, `counterStore.setCount(5)`. Everything is typed by inference — no interfaces written anywhere.

Full source: [src/examples/counter](https://github.com/priolo/jon/blob/master/src/examples/counter/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/counter-kc4lj5)
