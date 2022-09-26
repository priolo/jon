/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, fireEvent, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore, useStore } from '../lib/store/rvx_juice'


let myStore

beforeEach(() => {
	myStore = createStore({
		state: {
			value: "init value",
		},
		getters: {
			getUppercase: (_, { state }) => state.value.toUpperCase(),
		},
		actions: {
			changeValue: (value, {setValue}) => {
				setValue(`${value}... from action!`)
			}
		},
		mutators: {
			setValue: value => ({ value }),
		},
	})
})


test('getters/mutators', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// ha il valore iniziale?
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
