---
title: 'List rows'
sidebar_label: 'List rows'
sidebar_position: 5
---

# List rows

The classic list problem: update one item without re-rendering every row. No normalization, no per-row stores — just a predicate that compares the row's **reference**.

```tsx
import { memo } from "react"
import { createStore, useStore, Store } from "@priolo/jon"

interface Item {
  id: number
  count: number
}

const listStore = createStore({

  state: {
    items: [0, 1, 2, 3, 4].map(id => ({ id, count: 0 })) as Item[],
  },

  mutators: {
    // increment ONE item: the others keep the SAME reference,
    // and that's what lets each row compare by reference in its predicate
    increment: (id: number, store: Store) => ({
      items: store.state.items.map((it: Item) =>
        it.id == id ? { ...it, count: it.count + 1 } : it),
    }),
  },

})

// each row subscribes ONLY to its own element
const Row = memo(function Row({ index }: { index: number }) {
  const state = useStore(listStore, (s, old) => s.items[index] != old.items[index])
  const item = state.items[index]

  return (
    <div>
      item {item.id}
      <button onClick={() => listStore.increment(item.id)}>+1</button>
      count: {item.count}
    </div>
  )
})

// the parent does NOT subscribe: clicking a row re-renders only that row
export default function App() {
  return <div>
    {listStore.state.items.map((it, index) => <Row key={it.id} index={index} />)}
  </div>
}
```

## What's going on

- The mutator maps over the array but only spreads a new object for the changed item. Untouched items keep their identity, so `s.items[index] != old.items[index]` is `false` for every other row.
- `memo` isolates the rows from parent renders, the predicate isolates them from each other. Click `+1` on row 2 and *only* row 2 re-renders.
- The runnable version shows a render counter per row so you can verify it.

Full source: [src/examples/listRows](https://github.com/priolo/jon/blob/master/src/examples/listRows/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/list-rows-gg4sq9)
