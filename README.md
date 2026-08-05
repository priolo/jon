![logo](./res/logo.png)  

## Installation

`npm install @priolo/jon`

## [Documentation](https://priolo.github.io/jon-doc/)


## [Examples](https://priolo.github.io/jon-doc/docs/examples)


## [Complete Project](https://github.com/priolo/jon-template)

## For LLM agents

You don't need to install anything: copy [src/lib/store/rvx_juice.ts](./src/lib/store/rvx_juice.ts) into the project as-is. It is a single self-contained file (react is the only dependency) exporting `createStore` and `useStore`.

A store is created from a "setup" object with 4 sections:

- **`state`** — initial state: plain object (deep-cloned) or a `() => state` factory
- **`mutators`** — the ONLY way to change state. Synchronous. Return a PARTIAL state object (shallow-merged into the current state); return `undefined` to skip the update.
- **`actions`** — sync/async side effects and orchestration. They don't return state: they call mutators through the injected `store` handle.
- **`getters`** — derived/computed values.

Every setup function receives `(payload, store)` — treat `store` like `this`: read `store.state`, call siblings as `store.setX(...)`.

Rules (this is NOT redux/zustand — common mistakes):

- Call methods directly on the store, passing ONLY the payload: `myStore.setCount(3)`.
- Never write `store.state` directly; only mutators replace state.
- `useStore(store, fn?)`: `fn(state, oldState) => boolean` is a re-render PREDICATE, not a selector. `useStore` always returns the full state.

```jsx
import { createStore, useStore } from "./rvx_juice"

const counterStore = createStore({
  state: { count: 0, label: "" },
  getters: {
    isEven: (_, store) => store.state.count % 2 == 0,
  },
  mutators: {
    setCount: (count) => ({ count }),      // partial: `label` is untouched
    setLabel: (label) => ({ label }),
  },
  actions: {
    fetchCount: async (url, store) => {
      const res = await fetch(url)
      store.setCount(await res.json())
    },
  },
})

function Counter() {
  const state = useStore(counterStore)
  return <button onClick={() => counterStore.setCount(state.count + 1)}>
    {state.count} — {counterStore.isEven() ? "even" : "odd"}
  </button>
}
```

Bonus: store actions/mutators are `name(payload) => result`, which maps 1:1 onto an LLM tool/function declaration — the agent and the UI can then mutate the same reactive state (see [src/lib/experimentals/storeToAiTools.ts](./src/lib/experimentals/storeToAiTools.ts)).

---

## ROADMAP

- Documentation
- Involvement of the community
- Development of plugins to be applied to the library

## DEVELOPMENT NOTE

If you use a local hard-link in package.json for testing  
`npm link <path_app>/node_modules/react`  
to avoid the "Invalid hook call" error  
https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react

example:  
`npm link ||C:\Users\iorio\Documents\luca\zero\zero-os\web\||node_modules\react`

this solution apparently does not work if you use VOLTA
in that case you have to delete, in the JON project, inside `node_modules`
the folders:
- react
- react-dom