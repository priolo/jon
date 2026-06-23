import { createStore, Store } from '../lib/store/rvx_juice'
import { storeToTools } from '../lib/store/rvx_tools'

/**
 * Example: a fully-typed store WITHOUT any cast or hand-written `extends`
 * interface. All the typing comes from the mapped types inside `createStore`,
 * which infer the state and strip the injected `store` parameter from each
 * method's public signature.
 */

// 1) The state shape (used to type `store.state` inside the setup functions).
interface CounterState {
	count: number
	label: string
}

// 2) The setup. Annotate the `store` param with `Store<CounterState>` so that
//    `store.state` is typed inside the functions. Sibling calls like
//    `store.setCount(...)` go through the permissive handle and are NOT
//    type-checked — that is the trade-off for not declaring the store type by
//    hand (no circular `AgentStore` interface, no cast).
const setup = {
	state: (): CounterState => ({ count: 0, label: 'init' }),

	getters: {
		// `_: void` -> the public method takes no argument: `double(): number`
		double: (_: void, store: Store<CounterState>) => store.state.count * 2,
	},

	actions: {
		incBy: async (amount: number, store: Store<CounterState>) => {
			store.setCount(store.state.count + amount) // sibling call (untyped)
			return store.state.count
		},
	},

	mutators: {
		setCount: (count: number) => ({ count }),
		setLabel: (label: string) => ({ label }),
	},
}

// 3) Instantiate. No `as`, no manual interface: the type is inferred.
export const counterStore = createStore(setup)

// ✅ Fully typed externally (hover to check the inferred signatures):
counterStore.setCount(5)        // (count: number) => void
counterStore.setLabel('hi')     // (label: string) => void
counterStore.double()           // () => number
counterStore.incBy(3)           // (amount: number) => Promise<number>
counterStore.state.count        // number

// ❌ The following are compile errors — uncomment to verify the type-checker:
// counterStore.setCount('x')   // Argument of type 'string' is not assignable to 'number'
// counterStore.setCount()      // Expected 1 argument, but got 0
// counterStore.nope()          // Property 'nope' does not exist

// 4) The same store, exposed as agent tools (see rvx_tools.ts).
export const counterTools = storeToTools(counterStore, [
	{
		name: 'setCount',
		description: 'Set the counter to an absolute value',
		parameters: { type: 'object', properties: { count: { type: 'number' } }, required: ['count'] },
		map: (a) => a.count, // the mutator expects a bare number, not { count }
	},
	{
		name: 'incBy',
		description: 'Increment the counter by a relative amount',
		parameters: { type: 'object', properties: { amount: { type: 'number' } }, required: ['amount'] },
		map: (a) => a.amount,
	},
])
