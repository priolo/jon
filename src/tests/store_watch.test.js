import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore, useStore} from '../lib/store/rvx'
import { addWatch } from '../lib/store/rvxPlugin'

let myStore1
let myStore2

beforeEach(() => {
	myStore1 = createStore({
		state: {
			value1: "init value1",
			value2: "init value2",
		},
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
	myStore2 = createStore({
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

	addWatch({
		store: myStore1,
		actionName: "setValue1",
		callback: ({ type, store, key, payload }) => {
			myStore2.changeValue(payload)
		}
	})
})

test('main watch', async () => {

	render(<>
		<TestView />
		<TestCommand />
	</>)

	// with reducer
	await act(async () => {
		myStore1.changeValue1("value-changed")
	})

	await new Promise(res => setTimeout(res, 1000))

	expect(myStore1.state.value1).toBe("value-changed... from 1")
	expect(myStore1.state.value2).toBe("init value2")
	expect(myStore2.state.value).toBe("value-changed... from 1... from 2")
})


function TestView() {
	//const s1 = useStore(myStore1)
	const s2 = useStore(myStore2)
	return <div data-testid="view">{s2.value}</div>
}

function TestCommand() {
	const { changeValue, setValue } = myStore2
	const handleClick = async () => {
		await changeValue("hook:action")
		setValue("hook:mutator")
	}
	return <button onClick={handleClick}>click</button>
}
