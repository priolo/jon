---
title: 'Router'
sidebar_label: 'Router'
sidebar_position: 7
---

# Router

Do you really need a router library for an SPA? A store with one state field (`path`), one action (`goto`) and one getter (`match`) covers navigation, parameterized routes and the browser's back button.

```ts title="routerStore.ts"
import { createStore, Store } from "@priolo/jon"

/**
 * Compares `path` with a pattern like "/user/{id}".
 * Returns the extracted params ({ id: "42" }) or `null` if it doesn't match.
 */
function matchPath(pattern: string, path: string): Record<string, string> | null {
  const names: string[] = []
  const source = pattern.replace(/\{([^}]+)\}/g, (_, name) => (names.push(name), "([^/]+)"))
  const found = new RegExp(`^${source}$`).exec(path)
  return found ? Object.fromEntries(names.map((name, i) => [name, found[i + 1]])) : null
}

const routerStore = createStore({

  state: {
    path: window.location.pathname,
  },

  getters: {
    // params of the current path, or null if it doesn't match
    match: (pattern: string, store: Store) => matchPath(pattern, store.state.path),
  },

  actions: {
    // navigate: update the browser URL and the state (no reload)
    goto: (path: string, store: Store) => {
      window.history.pushState({}, "", path)
      store.setPath(path)
    },
  },

  mutators: {
    setPath: (path: string) => ({ path }),
  },
})

// browser back/forward: realign the store to the current URL
window.addEventListener("popstate", () => routerStore.setPath(window.location.pathname))

export default routerStore
```

```tsx title="App.tsx"
import { useStore } from "@priolo/jon"
import routerStore from "./routerStore"

export default function App() {
  // any path change re-renders the component
  useStore(routerStore)

  const about = routerStore.match("/user/{id}")

  return (
    <div>
      <nav>
        <a onClick={() => routerStore.goto("/")}>Home</a>
        <a onClick={() => routerStore.goto("/user/42")}>User</a>
      </nav>

      {routerStore.match("/") && <p>Welcome home.</p>}
      {about && <p>User page · id = {about.id}</p>}
    </div>
  )
}
```

## What's going on

- `match` returns the params object or `null` — and since `null` is falsy, the same call doubles as the "does this route match?" test.
- `goto` pushes the new URL into browser history *and* mutates the store; the `popstate` listener handles back/forward by pushing the URL back into the store. The URL bar and the state can't drift apart.
- Rendering routes is just conditional JSX — no `<Route>` components, no context, nothing to configure.

Full source: [src/examples/router](https://github.com/priolo/jon/tree/master/src/examples/router)
