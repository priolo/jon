import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, setupStore, useStore } from '../lib/store/rvxProviders'


beforeEach(() => {
	// create CONTEXT and STORE
	setupStore({ myStore1: mySetup1, myStore2: mySetup2 })
})

test('getters/mutators', async () => {
	render(<MultiStoreProvider><TestView /><TestCommand /></MultiStoreProvider>)

	const myStore1 = getStore("myStore1")
	const myStore2 = getStore("myStore2")

	waitFor(()=>{
		expect(screen.getByTestId('view')).toHaveTextContent("init value2")
	})
})

const mySetup1 = {
	state: {
		value: "init value1",
	},
	init: (store)=>{
		const { state:s2 } = getStore("myStore2")
		store.setValue(s2.value)
	},
	actions: {
		changeValue: (state, value, store) => {
			store.setValue(`${value}... from 1`)
		}
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
}

const mySetup2 = {
	state: {
		value: "init value2",
	},
	actions: {
		changeValue: (state, value, store) => {
			store.setValue(`${value}... from 2`)
		}
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
}

function TestView() {
	const { state: s1 } = useStore("myStore1")
	const { state: s2 } = useStore("myStore2")
	return <div data-testid="view">{s1.value}</div>
}

function TestCommand() {
	const { changeValue, setValue } = useStore("myStore2")
	const handleClick = async () => {
		await changeValue("hook:action")
		setValue("hook:mutator")
	}
	return <button onClick={handleClick}>click</button>
}
