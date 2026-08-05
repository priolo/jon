// jon · composable setup-stores with mixStores
// https://codesandbox.io/p/sandbox/mix-stores-8n87qm

import { Store, StoreSetup } from "../../lib/store/global"
import mixStores from "../../lib/store/mixStores"
import { createStore, useStore } from "../../lib/store/rvx"

/**
 * mixStores: merges several SETUP-STOREs into a single one, like a chain of "extends".
 *
 * Here the "persist" example is rebuilt by splitting the two roles:
 * - `persistSetup` is a GENERIC, reusable setup (a sort of abstract
 *   class: it doesn't know WHICH properties it is saving)
 * - `noteSetup` implements the real properties
 *
 * Uses the full library (rvx.ts), NOT rvx_juice:
 * mixStores and onStateChange are not in the juice file.
 */

const STORAGE_KEY = "jon-mix-stores-example"

/** generic setup: makes ANY setup it is mixed with persistent */
function persistSetup(key: string): StoreSetup<any> {
	return {

		// on boot: reads back the last saved state (or nothing, if there isn't one)
		state: () => {
			const saved = localStorage.getItem(key)
			return saved ? JSON.parse(saved) : {}
		},

		// on every change: save
		onStateChange: (store) => {
			localStorage.setItem(key, JSON.stringify(store.state))
		},

	}
}

/** concrete setup: the real properties and their logic */
const noteSetup = {

	state: {
		text: "",
		count: 0,
	},

	actions: {
		reset: (_: void, store: Store) => {
			localStorage.removeItem(STORAGE_KEY)
			store.setText("")
			store.setCount(0)
		},
	},

	mutators: {
		setText: (text: string) => ({ text }),
		setCount: (count: number) => ({ count }),
	},

}

/**
 * the mix: order matters! On conflict the last setup wins
 * (like a subclass override): here the state saved by
 * `persistSetup` must win over the defaults of `noteSetup`.
 */
const noteStore: Store = createStore(mixStores(noteSetup, persistSetup(STORAGE_KEY))!)

export default function App() {

	const { text, count } = useStore(noteStore)

	return (
		<div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
			<h1>jon · composable setup-stores with mixStores</h1>

			<p>
				the store is the mix of a generic "persistent" setup and one with the real properties.<br />
				type something, click +1, then <b>reload the page</b>: the state is still there.
			</p>

			<div style={{ display: "flex", gap: 8 }}>
				<input value={text} onChange={e => noteStore.setText(e.target.value)} placeholder="a note..." />
				<button onClick={() => noteStore.setCount(count + 1)}>+1</button>
				<button onClick={() => noteStore.reset()}>reset</button>
			</div>

			<p>text: <code>{text || "(empty)"}</code> · count: <code>{count}</code></p>
		</div>
	);
}
