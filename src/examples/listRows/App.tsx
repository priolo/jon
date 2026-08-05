// Example of list with subscription per line in jon
// https://codesandbox.io/p/sandbox/list-rows-gg4sq9

import { memo, useRef } from "react"
import { createStore, Store, useStore } from "../../lib/store/rvx_juice"



interface Item {
  id: number
  count: number
}

const listStore = createStore({

  state: {
    items: [0, 1, 2, 3, 4].map(id => ({ id, count: 0 })) as Item[],
  },

  mutators: {
    /**
     * increments a single item: the other array elements keep the
     * SAME reference, and that's what lets the rows compare by
     * reference in the useStore predicate
     */
    increment: (id: number, store: Store) => ({
      items: store.state.items.map((it: Item) => it.id == id ? { ...it, count: it.count + 1 } : it),
    }),
  },

})

/** counts how many times the component has rendered */
function useRenderCount() {
  const renders = useRef(0)
  renders.current++
  return renders.current
}

/**
 * Each row subscribes ONLY to its own element: the predicate compares the
 * reference of `items[index]`. `memo` isolates it from parent renders.
 */
const Row = memo(function Row({ index }: { index: number }) {
  const state = useStore(listStore, (s, old) => s.items[index] != old.items[index])
  const item: Item = state.items[index]
  const renders = useRenderCount()

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid #ccc", padding: 8 }}>
      <span>item <code>{item.id}</code></span>
      <button onClick={() => listStore.increment(item.id)}>+1</button>
      <span>count: <code>{item.count}</code></span>
      <span style={{ marginLeft: "auto", color: "#888" }}>renders performed: <code>{renders}</code></span>
    </div>
  )
})

/** the parent does NOT subscribe to the store: clicking a row re-renders only that one */
export default function App() {

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
      <h1>jon · list with subscription per line</h1>

      {listStore.state.items.map((it: Item, index: number) => <Row key={it.id} index={index} />)}
    </div>
  );
}
