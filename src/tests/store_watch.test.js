import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, useStore } from '../lib/store/rvxProviders'


test('main watch', async () => {

	render(
		<MultiStoreProvider setups={{ myStore1: mySetup1, myStore2: mySetup2 }}>
			<TestView />
			<TestCommand />
		</MultiStoreProvider>
	)

	const myStore1 = getStore("myStore1")
	const myStore2 = getStore("myStore2")

	// with reducer
	await act(async () => {
		myStore1.changeValue1("value-changed")
	})

	await new Promise(res => setTimeout(res, 1000))

	expect(myStore1.state.value1).toBe("value-changed... from 1")
	expect(myStore1.state.value2).toBe("init value2")
	expect(myStore2.state.value).toBe("value-changed... from 1... from 2")
})

const mySetup1 = {
	state: {
		value1: "init value1",
		value2: "init value2",
	},
	actions: {
		changeValue1: (state, value, store) => {
			store.setValue1(`${value}... from 1`)
		}
	},
	mutators: {
		setValue1: (state, value1) => ({ value1 }),
		setValue2: (state, value2) => ({ value2 }),
	},
}

const mySetup2 = {
	state: {
		value: "init value",
	},
	actions: {
		changeValue: (state, value, store) => {
			store.setValue(`${value}... from 2`)
		}
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
	watch: {
		"myStore1": {
			"setValue1": (store, value) => {
				store.changeValue(value)
			}
		}
	}
}


function TestView() {
	const { state: s1 } = useStore("myStore1")
	const { state: s2 } = useStore("myStore2")
	return <div data-testid="view">{s2.value}</div>
}

function TestCommand() {
	const { changeValue, setValue } = useStore("myStore2")
	const handleClick = async () => {
		await changeValue("hook:action")
		setValue("hook:mutator")
	}
	return <button onClick={handleClick}>click</button>
}
