import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, setupStore, useStore } from '../lib/store/rvxProviders'


beforeEach(() => {
	// create CONTEXT and STORE
	setupStore({ myStore: setupMyStore })
})

test('simply getStore', async () => {

	render(<MultiStoreProvider><TestView /><TestCommand/></MultiStoreProvider>)

	// get myStore with reducer
	const myStoreWithReducer = getStore("myStore")
	expect(myStoreWithReducer.state.value).toBe("init value")

	// change state value with reducer
	act(() => {
		myStoreWithReducer.setValue("new value")
	})
	expect(screen.getByTestId('view')).toHaveTextContent("new value")

	// get value with getter
	expect(myStoreWithReducer.getUppercase()).toBe("NEW VALUE")

})

test('simply useStore', async () => {

	render(<MultiStoreProvider><TestView /><TestCommand/></MultiStoreProvider>)

	// get myStore with reducer
	const myStoreWithReducer = getStore("myStore")
	expect(myStoreWithReducer.state.value).toBe("init value")

	// change state value with event
	fireEvent.click(screen.getByText('click'))

	expect(screen.getByTestId('view')).toHaveTextContent("new value")

	// get value with getter
	expect(myStoreWithReducer.getUppercase()).toBe("NEW VALUE")

})

const setupMyStore = {
	state: {
		value: "init value",
	},
	getters: {
		getUppercase: (state) => state.value.toUpperCase(),
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
}

function TestView() {

	const { state } = useStore("myStore")

	return <div data-testid="view">{state.value}</div>
}

function TestCommand() {

	const {  setValue } = useStore("myStore")

	return <button onClick={() => setValue("new value")}>click</button>
}
