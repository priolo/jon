import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore, useStore } from '../lib/store/rvx'
import { addWatch } from '../lib/store/rvxPlugin'


let myStore

beforeEach(() => {
	myStore = createStore({
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
	})
})

test('action', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	const results = []

	// ascolta tutti i "changeValue" dello store "myStore"
	addWatch({
		store: myStore,
		actionName: "changeValue",
		callback: ({ type, store, key, payload }) => {
			results.push({ type, key, payload })
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
			key: "changeValue",
			payload: "reducer:action",
		},
		{
			type: "action",
			key: "changeValue",
			payload: "hook:action",
		},
	])

})

test('store', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	const results = []

	// ascolta tutti i "changeValue" dello store "myStore"
	addWatch({
		store: myStore,
		actionName: "*",
		callback: ({ type, store, key, payload }) => {
			results.push({ type, key, payload })
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
			key: "setValue",
			payload: "reducer:mutator",
		},
		{
			type: "mutation",
			key: "setValue",
			payload: "reducer:action... from action!",
		},
		{
			type: "action",
			key: "changeValue",
			payload: "reducer:action",
		},
		{
			type: "mutation",
			key: "setValue",
			payload: "hook:action... from action!",
		},
		{
			type: "action",
			key: "changeValue",
			payload: "hook:action",
		},
		{
			type: "mutation",
			key: "setValue",
			payload: "hook:mutator",
		},
	])

})

// test('JON', async () => {

// 	render(
// 		<MultiStoreProvider setups={{ myStore: setupMyStore, myStore2: setupMyStore }}>
// 			<TestView />
// 			<TestCommand />
// 		</MultiStoreProvider>
// 	)

// 	const results = []
// 	const myStore = getStore("myStore")
// 	const myStore2 = getStore("myStore2")

// 	// ascolta tutti i "changeValue" dello store "myStore"
// 	addWatch({
// 		storeName: "*",
// 		actionName: "*",
// 		callback: ({ type, storeName, key, payload }) => {
// 			results.push({ type, storeName, key, payload })
// 		}
// 	})

// 	// with reducer
// 	await act(async () => {
// 		myStore.setValue("reducer:mutator")
// 		await myStore2.changeValue("reducer:action")
// 	})

// 	expect(results).toEqual([
// 		{
// 			type: "mutation",
// 			storeName: "myStore",
// 			key: "setValue",
// 			payload: "reducer:mutator",
// 		},
// 		{
// 			type: "mutation",
// 			storeName: "myStore2",
// 			key: "setValue",
// 			payload: "reducer:action... from action!",
// 		},
// 		{
// 			type: "action",
// 			storeName: "myStore2",
// 			key: "changeValue",
// 			payload: "reducer:action",
// 		},
// 	])

// })




function TestView() {
	const state = useStore(myStore)
	return <div data-testid="view">{state.value}</div>
}

function TestCommand() {
	const { changeValue, setValue } = myStore
	const handleClick = async () => {
		await changeValue("hook:action")
		setValue("hook:mutator")
	}
	return <button onClick={handleClick}>click</button>
}
