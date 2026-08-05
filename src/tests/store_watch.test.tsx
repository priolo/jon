import { act, render, waitFor } from '@testing-library/react'
import { addWatch, createStore, removeWatch, useStore } from '../index'

function makeStore1() {
	return createStore({
		state: () => ({
			value1: "init value1",
			value2: "init value2",
		}),
		actions: {
			changeValue1: (value, store) => {
				store.setValue1(`${value}... from 1`)
			}
		},
		mutators: {
			setValue1: (value1) => ({ value1 }),
			setValue2: (value2) => ({ value2 }),
		},
	})
}

function makeStore2() {
	return createStore({
		state: {
			value: "init value",
		},
		actions: {
			changeValue: (value, store) => {
				store.setValue(`${value}... from 2`)
			}
		},
		mutators: {
			setValue: (value) => ({ value }),
		}
	})
}

let myStore1: ReturnType<typeof makeStore1>
let myStore2: ReturnType<typeof makeStore2>

beforeEach(() => {
	myStore1 = makeStore1()
	myStore2 = makeStore2()
})

test('addWatch/deleteWatch', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// addWatch
	// if "setValue1" of store1 changes then "value" of store2 changes too
	addWatch({
		store: myStore1,
		actionName: "setValue1",
		callback: ({ type, store, key, payload }) => {
			myStore2.changeValue(payload)
		}
	})

	await act(async () => {
		myStore1.changeValue1("value-changed")
	})

	// the watch propagates the change to store2 via changeValue (async action)
	await waitFor(() => expect(myStore2.state.value).toBe("value-changed... from 1... from 2"))
	expect(myStore1.state.value1).toBe("value-changed... from 1")
	expect(myStore1.state.value2).toBe("init value2")


	// removeWatch
	// store2 does not change anymore
	removeWatch({ store: myStore1 })

	await act(async () => {
		myStore1.changeValue1("value-changed-2")
	})

	expect(myStore1.state.value1).toBe("value-changed-2... from 1")
	// store2 unchanged: the watch has been removed
	expect(myStore2.state.value).toBe("value-changed... from 1... from 2")
})

// componente che visualizza i valori
function TestView() {
	//const s1 = useStore(myStore1)
	const s2 = useStore(myStore2)
	return <div data-testid="view">{s2.value}</div>
}

// componente che esegue le modifiche
function TestCommand() {
	const { changeValue, setValue } = myStore2
	const handleClick = async () => {
		await changeValue("hook:action")
		setValue("hook:mutator")
	}
	return <button onClick={handleClick}>click</button>
}
