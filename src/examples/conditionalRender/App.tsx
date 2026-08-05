// Example of conditional rendering in jon
// https://codesandbox.io/p/sandbox/snowy-hooks-5s996m

import { useRef } from "react"
import { createStore, useStore } from "../../lib/store/rvx_juice"



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

const NAMES = ["Jon", "Arya", "Sansa", "Bran"]

/** counts how many times the component has rendered */
function useRenderCount() {
  const renders = useRef(0)
  renders.current++
  return renders.current
}

/** re-renders ONLY when `name` changes: incrementing `count` doesn't touch it */
function NamePanel() {
  const { name } = useStore(userStore, (state, old) => state.name != old.name)
  const renders = useRenderCount()

  return (
    <fieldset>
      <legend>NamePanel · preached on <code>name</code></legend>
      <p>name: <code>{name}</code></p>
      <p>renderings performed: <code>{renders}</code></p>
    </fieldset>
  )
}

/** re-renders ONLY when `count` changes: changing `name` doesn't touch it */
function CountPanel() {
  const { count } = useStore(userStore, (state, old) => state.count != old.count)
  const renders = useRenderCount()

  return (
    <fieldset>
      <legend>CountPanel · preached on <code>count</code></legend>
      <p>count: <code>{count}</code></p>
      <p>renderings performed: <code>{renders}</code></p>
    </fieldset>
  )
}

/** no predicate: re-renders on EVERY store change */
function AllPanel() {
  const { name, count } = useStore(userStore)
  const renders = useRenderCount()

  return (
    <fieldset>
      <legend>AllPanel · without predicate</legend>
      <p>name: <code>{name}</code> · count: <code>{count}</code></p>
      <p>renderings performed: <code>{renders}</code></p>
    </fieldset>
  )
}

/**
 * The parent does NOT subscribe to the store (no useStore here):
 * this way each panel decides on its own when to re-render.
 */
export default function App() {

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>jon · conditional rendering</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => {
          const names = NAMES.filter(n => n != userStore.state.name)
          userStore.setName(names[Math.floor(Math.random() * names.length)])
        }}>change name</button>

        <button onClick={() => userStore.setCount(userStore.state.count + 1)}>increment count</button>
      </div>

      <NamePanel />
      <CountPanel />
      <AllPanel />
    </div>
  );
}
