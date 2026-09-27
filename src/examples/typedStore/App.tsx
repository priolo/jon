import { StoreOf } from "../../lib/store/global"
import mixStores from "../../lib/store/mixStores"
import { createStore, useStore } from "../../lib/store/rvx"



// ---

const counterSetup = {

	state: {
		count: 0
	},

	getters: {
		double: (_: void, store?: CounterStore) => store!.state.count * 2,
	},

	actions: {
		increment: (_: void, store?: CounterStore) => {
			store?.setCount(store.state.count + 1)
		},
	},

	mutators: {
		setCount: (count: number) => ({ count }),
	},
}

// `interface` (not `type`) and no `satisfies StoreSetup`: both would make the
// setup reference itself eagerly (TS7022). The interface is resolved lazily.
interface CounterStore extends StoreOf<typeof counterSetup> {}
type CounterState = CounterStore["state"]
const counterStore = createStore(counterSetup)


// ---


const messageSetup = {

	state: {
		message: "hello"
	},

	getters: {
		uppercase: (_: void, store?: MessageStore) => {
			return store?.state.message.toUpperCase()
		}
	},

	mutators: {
		setMessage: (message: string) => ({ message }),

	},
}

interface MessageStore extends StoreOf<typeof messageSetup> {}
const messageStore = createStore(messageSetup)


// ---


const mixedSetup = mixStores(counterSetup, messageSetup)
interface MixedStore extends StoreOf<typeof mixedSetup> {}
const mixedStore: MixedStore = createStore(mixedSetup)


// ---


export default function App() {
	const counter = useStore(counterStore)
	const message = useStore(messageStore)
	const mixed = useStore(mixedStore)

	return (
		<div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
			<h1>jon · fully typed stores</h1>

			<p>
				Two independent stores are mixed into a third store. Hover the store variables to inspect their inferred types.
			</p>

			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<button onClick={() => counterStore.increment()}>counter +1</button>
				<span>{counter.count}</span>
			</div>

			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<input value={message.message} onChange={event => messageStore.setMessage(event.target.value)} />
				<code>{messageStore.uppercase()}</code>
			</div>

			<p>
				mixed store: <code>{mixed.count}</code> · <code>{mixed.message}</code>
			</p>
			<button onClick={() => mixedStore.increment()}>mixed +1</button>
		</div>
	)
}
