import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, useStore } from '../lib/store/rvxProviders'


test('getters/mutators', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
			<TestCommand />
		</MultiStoreProvider>
	)

	// get myStore with reducer
	const myStore = getStore("myStore")
	expect(myStore.state.value).toBe("init value")

	// change state value with reducer
	act(() => {
		myStore.setValue("new value")
	})
	expect(screen.getByTestId('view')).toHaveTextContent("new value")

	// get value with getter
	expect(myStore.getUppercase()).toBe("NEW VALUE")

})

test('call action', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
			<TestCommand />
		</MultiStoreProvider>
	)

	// get myStore with reducer
	const myStore = getStore("myStore")

	// change state value with event (call action)
	await fireEvent.click(screen.getByText('click'))

	expect(screen.getByTestId('view')).toHaveTextContent("new value")

	// get value with getter
	expect(myStore.getUppercase()).toBe("NEW VALUE... FROM ACTION!")

})

const setupMyStore = {
	state: {
		value: "init value",
	},
	getters: {
		getUppercase: (state) => state.value.toUpperCase(),
	},
	actions: {
		changeValue: (state, value, store) => {
			store.setValue(`${value}... from action!`)
		}
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

	const { changeValue } = useStore("myStore")

	return <button onClick={() => changeValue("new value")}>click</button>
}
