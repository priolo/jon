// jon · optimized rendering on nested components
// https://codesandbox.io/p/sandbox/nested-render-wcnhll

import { memo, useRef } from "react"
import { createStore, useStore } from "../../lib/store/rvx_juice"



const dashboardStore = createStore({

  state: {
    title: "dashboard",
    left: 0,
    right: 0,
  },

  mutators: {
    setTitle: (title: string) => ({ title }),
    setLeft: (left: number) => ({ left }),
    setRight: (right: number) => ({ right }),
  },

})

const TITLES = ["dashboard", "panel", "dashboard", "console"]

/** counts how many times the component has rendered */
function useRenderCount() {
  const renders = useRef(0)
  renders.current++
  return renders.current
}

/**
 * Left child: subscribed ONLY to `left`.
 * `memo` is needed because of the nesting: without it, a Parent render
 * would re-render the child anyway, predicate or not.
 */
const LeftPanel = memo(function LeftPanel() {
  const { left } = useStore(dashboardStore, (state, old) => state.left != old.left)
  const renders = useRenderCount()

  return (
    <fieldset>
      <legend>LeftPanel · subscribed to <code>left</code></legend>
      <p>left: <code>{left}</code></p>
      <p>renderings performed: <code>{renders}</code></p>
    </fieldset>
  )
})

/** Right child: subscribed ONLY to `right` */
const RightPanel = memo(function RightPanel() {
  const { right } = useStore(dashboardStore, (state, old) => state.right != old.right)
  const renders = useRenderCount()

  return (
    <fieldset>
      <legend>RightPanel · subscribed to <code>right</code></legend>
      <p>right: <code>{right}</code></p>
      <p>renderings performed: <code>{renders}</code></p>
    </fieldset>
  )
})

/**
 * Parent: subscribed ONLY to `title`, contains the two children.
 * Changing `left` or `right` does NOT re-render it;
 * changing `title` re-renders it, but the children (memo) stay still.
 */
function Parent() {
  const { title } = useStore(dashboardStore, (state, old) => state.title != old.title)
  const renders = useRenderCount()

  return (
    <fieldset>
      <legend>Parent · subscribed to <code>title</code></legend>
      <p>title: <code>{title}</code> · renderings performed: <code>{renders}</code></p>

      <div style={{ display: "flex", gap: 12 }}>
        <LeftPanel />
        <RightPanel />
      </div>
    </fieldset>
  )
}

/** The root doesn't subscribe to the store: it just hosts the controls */
export default function App() {

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>jon · optimized rendering on nested components</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => {
          const next = (TITLES.indexOf(dashboardStore.state.title) + 1) % TITLES.length
          dashboardStore.setTitle(TITLES[next])
        }}>
          change title (parent)
        </button>
        <button onClick={() => dashboardStore.setLeft(dashboardStore.state.left + 1)}>
          increment left
        </button>
        <button onClick={() => dashboardStore.setRight(dashboardStore.state.right + 1)}>
          increment right
        </button>
      </div>

      <Parent />
    </div>
  );
}
