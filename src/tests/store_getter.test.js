import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore, useStore} from '../lib/store/rvx'

/**
 * TEST riguardanti le ACTION dello STORE
 */

 let myStore

 beforeEach(() => {
	 myStore = createStore({
		state: {
			value: "init value",
		},
		getters: {
			getValue: (state, _, store) => {
				return state.value.toUpperCase()
			}
		},
		actions: {
			changeValue: async (state, value, store) => {
				store.setValue(`${value} from action`)
			}
		},
		mutators: {
			setValue: (state, value) => {
				return { value }
			},
		},
	 })
 })

test('simply getStore', async () => {

	render(<TestView />)

	expect(myStore.state.value).toBe("init value")
	expect(myStore.getValue()).toBe("INIT VALUE")

	// change state value with reducer
	await act(async () => myStore.changeValue("new-value"))

	expect(myStore.state.value).toBe("new-value from action")
	expect(myStore.getValue()).toBe("NEW-VALUE FROM ACTION")
})

test('simply useStore', async () => {

	render(<TestView />)

	expect(myStore.state.value).toBe("init value")
	expect(myStore.getValue()).toBe("INIT VALUE")

	// change state value with event
	fireEvent.click(screen.getByText('click'))

	await waitFor(() => {
		expect(screen.getByTestId('view')).toHaveTextContent("NEW-VALUE FROM ACTION")
	})
})

function TestView() {

	useStore(myStore)

	return (<div>
		<button onClick={() => myStore.changeValue("new-value")}>click</button>
		<div data-testid="view">{myStore.getValue()}</div>
	</div>)
}
