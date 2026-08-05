// Example of counter in jon
// https://codesandbox.io/p/sandbox/counter-kc4lj5

import { createStore, Store, useStore } from "../../lib/store/rvx_juice"



const counterStore = createStore({

  // the initial state (deep-cloned on store creation)
  state: {
    count: 0,
  },

  // actions orchestrate: they read the state and call mutators via `store`
  actions: {
    increment: (_: void, store: Store) => {
      store.setCount(store.state.count + 1)
    },
  },

  // mutators are the only things that change state: they return a partial state to merge
  mutators: {
    setCount: (count: number) => ({ count }),
  },

})

export default function App() {

  // subscribe to the store: the component re-renders on every change of count
  const { count } = useStore(counterStore);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>jon · example of counter</h1>

      <button onClick={() => counterStore.increment()}>increases</button>

      <p>count: <code>{count}</code></p>
    </div>
  );
}
