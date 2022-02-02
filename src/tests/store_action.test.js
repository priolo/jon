import React, { useEffect } from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, setupStore, useStore } from '../lib/store/rvxProviders'

/**
 * TEST riguardanti le ACTION dello STORE
 */

beforeEach(() => {
	// create CONTEXT and STORE
	//setupStore({ myStore: setupMyStore })
})

test('simply getStore', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
		</MultiStoreProvider>
	)

	// get myStore with reducer
	const myStoreWithReducer = getStore("myStore")
	expect(myStoreWithReducer.state.value).toBe("init value")

	// change state value with reducer
	await act(async () => myStoreWithReducer.fetch())

	expect(screen.getByTestId('view')).toHaveTextContent("new value")
})

test('simply useStore', async () => {

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
		</MultiStoreProvider>
	)

	// get myStore with reducer
	const myStoreWithReducer = getStore("myStore")
	expect(myStoreWithReducer.state.value).toBe("init value")

	// change state value with event
	fireEvent.click(screen.getByText('click'))

	await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent("new value"))
})

test('sync motator -> action', async () => {

	function TestView() {
		const { state, setValue, processesValue, _syncAct } = useStore("myStore")
		const handleClick1 = () => {
			setValue("pippo")
			processesValue()
		}
		const handleClick2 = async () => {
			setValue("topolino")
			_syncAct(processesValue)
		}
		return <div>
			<button onClick={handleClick1}>click1</button>
			<button onClick={handleClick2}>click2</button>
			<div data-testid="view">{state.responseValue}</div>
		</div>
	}

	render(
		<MultiStoreProvider setups={{ myStore: setupMyStore }}>
			<TestView />
		</MultiStoreProvider>
	)

	// mi aspetto questo valore perche' "setValue" e "processValue" non sono sincronizzati
	fireEvent.click(screen.getByText('click1'))	
	await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent("INIT VALUE"))

	fireEvent.click(screen.getByText('click2'))
	await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent("TOPOLINO"))

})

const setupMyStore = {
	state: {
		value: "init value",
		responseValue: "",
	},
	actions: {
		fetch: async (state, _, store) => {
			// simulate http response
			await new Promise((res) => setTimeout(res, 1000))
			store.setValue("new value")
		},
		processesValue: (state, _, store) => {
			const valueTmp = state.value.toUpperCase()
			store.setResponseValue(valueTmp)
		},
	},
	mutators: {
		setValue: (state, value) => ({ value }),
		setResponseValue: (state, responseValue) => ({ responseValue }),
	},
}

function TestView() {

	const { state, fetch } = useStore("myStore")

	return (<div>
		<button onClick={() => fetch()}>click</button>
		<div data-testid="view">{state.value}</div>
	</div>)
}
