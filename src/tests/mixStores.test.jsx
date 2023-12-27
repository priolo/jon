import { act, fireEvent, render, screen } from '@testing-library/react'
import mixStores from '../lib/store/mixStores'
import { createStore, useStore } from '../lib/store/rvx'


let myStore

beforeEach(() => {
	const setup1 = {
		state: ()=>({
			value: "init value",
		}),
	}
	const setup2 = {
		getters: {
			getUppercase: (_, {state}) => state.value.toUpperCase(),
		},
		actions: {
			changeValue: (value, store) => {
				store.setValue(`${value}... from action!`)
			}
		},
	}
	const setup3 = {
		actions: {
			changeValue: (value, store) => {
				store.setValue(`${value}... from override action!`)
			}
		},
		mutators: {
			setValue: (value) => ({ value }),
		},
	}

	const setup123 = mixStores(setup1, setup2, setup3)
	myStore = createStore(setup123)

})


test('mixStores - mutator', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// ha il valore iniziale?
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
