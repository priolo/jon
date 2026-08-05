import { render, fireEvent, screen, act } from '@testing-library/react'
import { createStore, useStore } from '../lib/store/rvx_juice'


function makeStore() {
	return createStore({
		state: {
			value: "init value",
		},
		getters: {
			getUppercase: (_, { state }) => state.value.toUpperCase(),
		},
		actions: {
			changeValue: (value: string, { setValue }) => {
				setValue(`${value}... from action!`)
			}
		},
		mutators: {
			setValue: (value: string) => ({ value }),
		},
	})
}

let myStore: ReturnType<typeof makeStore>

beforeEach(() => {
	myStore = makeStore()
})


test('getters/mutators', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// does it have the initial value?
	expect(myStore.state.value).toBe("init value")
	expect(screen.getByTestId('view')).toHaveTextContent("init value")

	// change state value with reducer
	act(() => {
		myStore.setValue("new value")
	})
	
	expect(screen.getByTestId('view')).toHaveTextContent("new value")

})

test('call action', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// change state value with event (call action)
	await fireEvent.click(screen.getByText('click'))

	expect(screen.getByTestId('view')).toHaveTextContent("new value")

	// get value with getter
	expect(myStore.getUppercase()).toBe("NEW VALUE... FROM ACTION!")

})


function TestView() {
	const state = useStore(myStore)
	return <div data-testid="view">{state.value}</div>
}

function TestCommand() {
	return <button onClick={() => myStore.changeValue("new value")}>click</button>
}
