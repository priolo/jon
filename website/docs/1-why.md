---
title: 'Why'
sidebar_label: 'Why'
sidebar_position: 1
---

# Why Jon?

> Yet another React state library?!

Fair. But Jon makes a different bet than the others: it's so small that **the library itself is optional**.

## You don't install it. You copy it.

The whole store lives in one self-contained file: [`rvx_juice.ts`](https://github.com/priolo/jon/blob/master/src/lib/store/rvx_juice.ts) (~85 lines, its only import is `react`). Copy it into your project and you're done:

- **No entry in `package.json`.** No version bumps, no breaking changes, no supply chain to trust. The code is yours — read it, tweak it, own it.
- **Nothing can rot.** A file with zero dependencies doesn't stop working next year.

## Your LLM can actually *know* it

This one matters more every day. An AI agent working on your codebase can read `rvx_juice.ts` **in its entirety** and fully understand your state management — every line of it. No getting lost in a huge `node_modules` folder, no hallucinating APIs from half-remembered docs. The whole "library" fits comfortably in context.

Small isn't just nice for humans. Small is *legible to machines*.

## It's just React

Under the hood there is exactly one mechanism: React's own [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) hook. No proxies, no signals, no compiler magic. Yet you get a complete store pattern — Vuex/Pinia flavored, fully type-inferred:

```tsx title="Counter.tsx"
import { createStore, useStore, Store } from "./rvx_juice"

const counterStore = createStore({

  // the data
  state: {
    count: 0,
  },

  // computed values
  getters: {
    isEven: (_: void, store: Store) => store.state.count % 2 == 0,
  },

  // orchestration and side effects (can be async)
  actions: {
    increment: (_: void, store: Store) => {
      store.setCount(store.state.count + 1)
    },
  },

  // the ONLY things that change state: they return a partial state to merge
  mutators: {
    setCount: (count: number) => ({ count }),
  },

})

export default function Counter() {
  // subscribe: the component re-renders when the store changes
  const { count } = useStore(counterStore)

  return (
    <button onClick={() => counterStore.increment()}>
      {count} is {counterStore.isEven() ? "even" : "odd"}
    </button>
  )
}
```

That's the whole loop: `mutator → state change → useSyncExternalStore → re-render`. Everything is typed by inference from the setup object — no interfaces to write, no casts.

## Where to go next

- Prefer a regular npm package (and a few extra features)? See [Import](/docs/import).
- Want to see it solve real problems? Jump to the [Examples](/docs/examples/) — each one is tiny and solves exactly one problem.
