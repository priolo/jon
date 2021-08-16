import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, setupStore, useStore } from '../lib/store/rvxProviders'

/**
 * TEST riguardanti le ACTION dello STORE
 */


test('increment tree time', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
		</MultiStoreProvider>
	)

	const store = getStore("myStore")
	expect(store.state.value).toBe(10)

	await act(async () => store.incrementThreeTimes(1))

	expect(screen.getByTestId('view')).toHaveTextContent("13")
})

test('await next state', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
		</MultiStoreProvider>
	)

	const store = getStore("myStore")
	expect(store.state.value).toBe(10)

	store.setValue(11)
	store.setValue(store.state.value + 1)

	expect(store.state.value).toBe(12)
})

const setupMyStore = {
	state: {
		value: 10,
	},
	actions: {
		incrementThreeTimes: async (state, step, store) => {
			store.increment(step)
			await store._syncAct(store.increment, step)
			store._syncAct(store.increment, step)

		},
		increment: async (state, step, store) => {
			store.setValue(state.value + step)
		}
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
}

function TestView() {

	const { state, fetch } = useStore("myStore")

	return (<div>
		<button onClick={() => increment()}>click</button>
		<div data-testid="view">{state.value}</div>
	</div>)
}
