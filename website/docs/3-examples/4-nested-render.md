---
title: 'Nested render'
sidebar_label: 'Nested render'
sidebar_position: 4
---

# Nested render

Predicates control when a component re-renders *because of the store* — but a React parent re-rendering still re-renders its children the classic way. In a hierarchy, pair the predicate with `memo` and each level updates independently.

```tsx
import { memo } from "react"
import { createStore, useStore } from "@priolo/jon"

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

// child: subscribed ONLY to `left`.
// `memo` is what shields it from the Parent's own renders.
const LeftPanel = memo(function LeftPanel() {
  const { left } = useStore(dashboardStore, (state, old) => state.left != old.left)
  return <p>left: {left}</p>
})

const RightPanel = memo(function RightPanel() {
  const { right } = useStore(dashboardStore, (state, old) => state.right != old.right)
  return <p>right: {right}</p>
})

// parent: subscribed ONLY to `title`, contains the two children
function Parent() {
  const { title } = useStore(dashboardStore, (state, old) => state.title != old.title)
  return (
    <div>
      <h2>{title}</h2>
      <LeftPanel />
      <RightPanel />
    </div>
  )
}
```

## What's going on

- Changing `left` or `right` re-renders **only** the matching panel — the Parent's predicate says no.
- Changing `title` re-renders the Parent, but the children stay put thanks to `memo` (without it, React would re-render them along with the Parent, predicate or not).
- Rule of thumb: **predicate** decides when the store wakes a component up, **memo** decides whether the parent drags it along. In nested trees you usually want both.

Full source: [src/examples/nestedRender](https://github.com/priolo/jon/blob/master/src/examples/nestedRender/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/nested-render-wcnhll)
