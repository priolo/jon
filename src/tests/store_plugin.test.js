import React from 'react'
import { render, fireEvent, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, useStore } from '../lib/store/rvxProviders'
import { addWatch } from '../lib/store/rvxPlugin'


test('action', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
			<TestCommand />
		</MultiStoreProvider>
	)

	const results = []
	const myStore = getStore("myStore")

	// ascolta tutti i "changeValue" dello store "myStore"
	addWatch({
		storeName: "myStore",
		actionName: "changeValue",
		callback: ({ type, storeName, key, payload }) => {
			results.push({ type, storeName, key, payload })
		}
	})

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
			type: "action",
			storeName: "myStore",
			key: "changeValue",
			payload: "reducer:action",
		},
		{
			type: "action",
			storeName: "myStore",
			key: "changeValue",
			payload: "hook:action",
		},
	])

})

test('store', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
			<TestCommand />
		</MultiStoreProvider>
	)

	const results = []
	const myStore = getStore("myStore")

	// ascolta tutti i "changeValue" dello store "myStore"
	addWatch({
		storeName: "myStore",
		actionName: "*",
		callback: ({ type, storeName, key, payload }) => {
			results.push({ type, storeName, key, payload })
		}
	})

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
			type: "mutation",
			storeName: "myStore",
			key: "setValue",
			payload: "reducer:mutator",
		},
		{
			type: "mutation",
			storeName: "myStore",
			key: "setValue",
			payload: "reducer:action... from action!",
		},
		{
			type: "action",
			storeName: "myStore",
			key: "changeValue",
			payload: "reducer:action",
		},
		{
			type: "mutation",
			storeName: "myStore",
			key: "setValue",
			payload: "hook:action... from action!",
		},
		{
			type: "action",
			storeName: "myStore",
			key: "changeValue",
			payload: "hook:action",
		},
		{
			type: "mutation",
			storeName: "myStore",
			key: "setValue",
			payload: "hook:mutator",
		},
	])

})

test('JON', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore, myStore2: setupMyStore }}>
			<TestView />
			<TestCommand />
		</MultiStoreProvider>
	)

	const results = []
	const myStore = getStore("myStore")
	const myStore2 = getStore("myStore2")

	// ascolta tutti i "changeValue" dello store "myStore"
	addWatch({
		storeName: "*",
		actionName: "*",
		callback: ({ type, storeName, key, payload }) => {
			results.push({ type, storeName, key, payload })
		}
	})

	// with reducer
	await act(async () => {
		myStore.setValue("reducer:mutator")
		await myStore2.changeValue("reducer:action")
	})

	expect(results).toEqual([
		{
			type: "mutation",
			storeName: "myStore",
			key: "setValue",
			payload: "reducer:mutator",
		},
		{
			type: "mutation",
			storeName: "myStore2",
			key: "setValue",
			payload: "reducer:action... from action!",
		},
		{
			type: "action",
			storeName: "myStore2",
			key: "changeValue",
			payload: "reducer:action",
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
