---
title: 'Watch stores'
sidebar_label: 'Watch stores'
sidebar_position: 11
---

# Watch stores

Two stores that need to react to each other — user logs out, the cart must empty — without knowing each other exists. `addWatch` observes an action on one store and runs a callback: the coupling lives in one place, outside both stores.

:::info full library required
The watcher/plugin system is one of the extras of the [installed package](/docs/import) — the copy-paste juice file leaves it out on purpose.
:::

```tsx
import { createStore, useStore, addWatch, Store } from "@priolo/jon"

const authStore = createStore({

  state: {
    user: null as string | null,
  },

  actions: {
    login: (name: string, store: Store) => store.setUser(name),
    logout: (_: void, store: Store) => store.setUser(null),
  },

  mutators: {
    setUser: (user: string | null) => ({ user }),
  },

})

const cartStore = createStore({

  state: {
    items: [] as string[],
  },

  mutators: {
    addItem: (item: string, store: Store) => ({ items: [...store.state.items, item] }),
    clear: () => ({ items: [] as string[] }),
  },

})

// the watcher: when authStore runs the "logout" action, empty the cart.
// cartStore knows nothing about authStore and vice versa: the link is all here.
addWatch({
  store: authStore,
  actionName: "logout",
  callback: () => cartStore.clear(),
})
```

```tsx
export default function App() {
  const { user } = useStore(authStore)
  const { items } = useStore(cartStore)

  return (
    <div>
      {user
        ? <button onClick={() => authStore.logout()}>logout (also empties the cart)</button>
        : <button onClick={() => authStore.login("Jon")}>login</button>
      }
      <button disabled={!user} onClick={() => cartStore.addItem("sword")}>add sword</button>
      <p>cart: {items.join(", ") || "(empty)"}</p>
    </div>
  )
}
```

## What's going on

- Neither store imports the other. If tomorrow logout must also clear notifications, you add another `addWatch` — the stores don't change.
- The watcher fires when the *action* runs, so any way of logging out (button, session timeout, another watcher...) empties the cart.
- `removeWatch` unregisters a watcher with the same `{ store, actionName, callback }` triple.

Full source: [src/examples/watchStores](https://github.com/priolo/jon/blob/master/src/examples/watchStores/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/watch-store-5mrdny)
