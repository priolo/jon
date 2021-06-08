import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, setupStore, useStore } from '../lib/store/rvxProviders'


beforeEach(() => {
	// create CONTEXT and STORE
	setupStore({ myStore: setupMyStore })
})

test('getters/mutators', async () => {

	render(<MultiStoreProvider><TestView /><TestCommand /></MultiStoreProvider>)

	const results = []
	const myStore = getStore("myStore")
	const onChange = (type, key, payload, result) => {
		results.push({ type, key, payload, result })
	}
	myStore.subscribe(onChange)

	// with reducer
	await act(async () => {
		myStore.setValue("reducer:mutator")
		await myStore.changeValue("reducer:action")
	})

	// with hooks
	await fireEvent.click(screen.getByText('click'))

	await new Promise(res => setTimeout(res, 300))

	expect(results).toEqual([
		{
			type: 3,
			key: "setValue",
			payload: "reducer:mutator",
			result: undefined,
		},
		{
			type: 1,
			key: "changeValue",
			payload: "reducer:action",
			result: undefined,
		},
		{
			type: 1,
			key: "changeValue",
			payload: "hook:action",
			result: undefined,
		},
		{
			type: 3,
			key: "setValue",
			payload: "hook:mutator",
			result: undefined,
		},
	])

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
	const { changeValue, setValue } = useStore("myStore")
	const handleClick = async () => {
		await changeValue("hook:action")
		setValue("hook:mutator")
	}
	return <button onClick={handleClick}>click</button>
}
