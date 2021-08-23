import React from 'react'
import { render, fireEvent, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, useStore } from '../lib/store/rvxProviders'


test('events main', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
			<TestCommand />
		</MultiStoreProvider>
	)

	const results = []
	const myStore = getStore("myStore")
	const onChange = (payload) => {
		results.push(payload)
	}
	myStore.emitter.on("*", onChange)

	// with reducer
	await act(async () => {
		myStore.setValue("reducer:mutator")
		await myStore.changeValue("reducer:action")
	})

	// with hooks
	await fireEvent.click(screen.getByText('click'))

	// aspetto un po' altrimenti REACT non setta tutto
	await new Promise(res => setTimeout(res, 300))

	expect(results).toEqual([
		{
			event: "mutation",
			payload: {
				key: "setValue",
				payload: "reducer:mutator",
				subcall: false,
			},
		},
		{
			event: "mutation",
			payload: {
				key: "setValue",
				payload: "reducer:action... from action!",
				subcall: true,
			},
		},
		{
			event: "action",
			payload: {
				key: "changeValue",
				payload: "reducer:action",
				result: undefined,
				subcall: false,
			},
		},
		{
			event: "mutation",
			payload: {
				key: "setValue",
				payload: "hook:action... from action!",
				subcall: true,
			},
		},
		{
			event: "action",
			payload: {
				key: "changeValue",
				payload: "hook:action",
				result: undefined,
				subcall: false,
			},
		},
		{
			event: "mutation",
			payload: {
				key: "setValue",
				payload: "hook:mutator",
				subcall: false,
			},
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
