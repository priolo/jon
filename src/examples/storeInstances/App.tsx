// jon · multiple instances of the same setup-store
// https://codesandbox.io/p/sandbox/instances-fmt7mn

import { useState } from "react"
import { createStore, Store, useStore } from "../../lib/store/rvx_juice"

/**
 * A SETUP-STORE is a plain object: the "class".
 * Every createStore(setup) generates an independent INSTANCE: the state
 * (a plain object) is deep-cloned on every call,
 * so the instances share nothing.
 *
 * Here the setup describes a WINDOW and the App manages an array of them:
 * every window has its own store, every store its own UI.
 */
const windowSetup = {

	state: {
		title: "",
		minimized: false,
		count: 0,
	},

	actions: {
		toggle: (_: void, store: Store) => store.setMinimized(!store.state.minimized),
	},

	mutators: {
		setTitle: (title: string) => ({ title }),
		setMinimized: (minimized: boolean) => ({ minimized }),
		setCount: (count: number) => ({ count }),
	},

}

/** the "new" of the class: creates an instance and customizes it */
function createWindowStore(title: string): Store {
	const store = createStore(windowSetup)
	store.setTitle(title)
	return store
}

/**
 * The component receives ITS OWN instance via props: same code,
 * different store, different state.
 */
function Window({ store, onClose }: { store: Store, onClose: () => void }) {

	const { title, minimized, count } = useStore(store)

	return (
		<fieldset style={{ minWidth: 200 }}>
			<legend>
				<b>{title}</b>
				{" "}
				<button onClick={() => store.toggle()}>{minimized ? "▢" : "—"}</button>
				<button onClick={onClose}>✕</button>
			</legend>

			{!minimized && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<button onClick={() => store.setCount(count + 1)}>+1</button>
				<span>count: <code>{count}</code></span>
			</div>}
		</fieldset>
	)
}

/** the App keeps the LIST of instances; the state of each window lives in its own store */
let lastId = 0
function newWindow() {
	return { id: ++lastId, store: createWindowStore(`window ${lastId}`) }
}

export default function App() {

	const [windows, setWindows] = useState(() => [newWindow(), newWindow()])

	return (
		<div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
			<h1>jon · multiple instances of the same setup-store</h1>

			<div>
				<button onClick={() => setWindows(ws => [...ws, newWindow()])}>open a window</button>
			</div>

			<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
				{windows.map(w =>
					<Window key={w.id} store={w.store}
						onClose={() => setWindows(ws => ws.filter(x => x.id != w.id))} />
				)}
			</div>
		</div>
	);
}
