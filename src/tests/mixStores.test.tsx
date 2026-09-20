import { act, fireEvent, render, screen } from '@testing-library/react'
import mixStores from '../lib/store/mixStores'
import { createStore, useStore } from '../lib/store/rvx'
import type { Store } from '../lib/store/global'


const setup1 = {
	state: (): { value: string } => ({
		value: "init value",
	}),
}
const setup2 = {
	getters: {
		getUppercase: (_: any, { state }: Store): string => state.value.toUpperCase(),
	},
	actions: {
		changeValue: (value: string, store: Store): void => {
			store.setValue(`${value}... from action!`)
		}
	},
}
const setup3 = {
	actions: {
		changeValue: (value: string, store: Store): void => {
			store.setValue(`${value}... from override action!`)
		}
	},
	mutators: {
		setValue: (value: string) => ({ value }),
	},
}

// `mixStores` preserves the types of the heterogeneous setups it merges.
let myStore: Store

beforeEach(() => {
	const setup123 = mixStores(setup1, setup2, setup3)!
	myStore = createStore(setup123)

})


test('mixStores - mutator', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// does it have the initial value?
	expect(myStore.state.value).toBe("init value")

	// change state value with reducer
	act(() => {
		myStore.setValue("new value")
	})
	expect(screen.getByTestId('view')).toHaveTextContent("new value")

	// get value with getter
	expect(myStore.getUppercase()).toBe("NEW VALUE")

})

test('mixStores - action', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// change state value with event (call action)
	await fireEvent.click(screen.getByText('click'))

	expect(screen.getByTestId('view')).toHaveTextContent("new value")

	// get value with getter
	expect(myStore.getUppercase()).toBe("NEW VALUE... FROM OVERRIDE ACTION!")

})

// test('mixStores - store', async () => {

// 	let value = 0


// })


function TestView() {
	const state = useStore(myStore)
	return <div data-testid="view">{state.value}</div>
}

function TestCommand() {
	return <button onClick={() => myStore.changeValue("new value")}>click</button>
}
