// jon · two stores communicating through a watcher
// https://codesandbox.io/p/sandbox/watch-store-5mrdny

import { Store } from "../../lib/store/global"
import { createStore, useStore } from "../../lib/store/rvx"
import { addWatch } from "../../lib/store/rvxPlugin"

/**
 * Two stores communicating through a WATCHER.
 *
 * This example uses the full library (rvx.ts), NOT rvx_juice:
 * the juice file deliberately omits the plugin/watcher system.
 * This is what you gain by installing the package instead of copy-pasting.
 */

const authStore = createStore({

  state: {
    user: null as string | null,
  },

  actions: {
    login: (name: string, store?: Store) => store?.setUser(name),
    logout: (_: void, store?: Store) => store?.setUser(null),
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
    addItem: (item: string, store?: Store) => store
      ? { items: [...store.state.items, item] }
      : undefined,
    clear: () => ({ items: [] as string[] }),
  },

})

// the watcher: when the "logout" action runs on authStore, it empties the cart.
// cartStore knows nothing about authStore and vice versa: the whole binding lives here.
addWatch({
  store: authStore,
  actionName: "logout",
  callback: () => cartStore.clear(),
})

const PRODUCTS = ["sword", "shield", "potion"]

export default function App() {

  const { user } = useStore(authStore)
  const { items } = useStore(cartStore)

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>jon · two stores connected by a watcher</h1>

      <fieldset>
        <legend>authStore</legend>
        {user
          ? <p>hi <b>{user}</b> · <button onClick={() => authStore.logout()}>logout (empty the cart too)</button></p>
          : <p><button onClick={() => authStore.login("Jon")}>login</button></p>
        }
      </fieldset>

      <fieldset>
        <legend>cartStore</legend>
        <div style={{ display: "flex", gap: 8 }}>
          {PRODUCTS.map(p =>
            <button key={p} disabled={!user} onClick={() => cartStore.addItem(p)}>add {p}</button>
          )}
        </div>
        <p>cart: <code>{items.length ? items.join(", ") : "(empty)"}</code></p>
      </fieldset>
    </div>
  );
}
