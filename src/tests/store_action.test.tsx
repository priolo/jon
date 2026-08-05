import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createStore, useStore } from '../lib/store/rvx'

/**
 * TESTS about the STORE ACTIONS
 */

function makeStore() {
	return createStore({
		state: () => ({
			value: "init value",
			responseValue: "",
		}),
		actions: {
			fetch: async (_, store) => {
				// simulate http response
				await new Promise((res) => setTimeout(res, 100))
				store.setValue("new value")
			},
			processesValue: (_, { state, ...store }) => {
				const valueTmp = state.value.toUpperCase()
				store.setResponseValue(valueTmp)
			},
		},
		mutators: {
			setValue: (value) => ({ value }),
			setResponseValue: (responseValue) => ({ responseValue }),
		},
	})
}

let myStore: ReturnType<typeof makeStore>

beforeEach(() => {
	myStore = makeStore()
})

test('simply getStore', async () => {

	render(<TestView />)

	expect(myStore.state.value).toBe("init value")

	// change state value with reducer
	await act(async () => myStore.fetch())

	expect(screen.getByTestId('view')).toHaveTextContent("new value")
})

test('simply useStore', async () => {

	render(<TestView />)

	// verify if the value is initialized 
	expect(myStore.state.value).toBe("init value")

	// change state value with event
	fireEvent.click(screen.getByText('click'))

	// verify if the value is updated (waitFor poll the async action chain)
	await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent("new value"))
})

/*
test('sync motator -> action', async () => {

	function TestView() {
		const state = useStore(myStore)
		const handleClick1 = () => {
			myStore.setValue("pippo")
			myStore.processesValue()
		}
		const handleClick2 = async () => {
			myStore.setValue("topolino")
			myStore._syncAct(myStore.processesValue)
		}
		return <div>
			<button onClick={handleClick1}>click1</button>
			<button onClick={handleClick2}>click2</button>
			<div data-testid="view">{state.responseValue}</div>
		</div>
	}

	render(<TestView />)

	// I expect this value because "setValue" and "processValue" are not synchronized
	fireEvent.click(screen.getByText('click1'))	
	await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent("INIT VALUE"))

	fireEvent.click(screen.getByText('click2'))
	await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent("TOPOLINO"))

})
*/

function TestView() {

	const state = useStore(myStore)

	return (<div>
		<button onClick={() => myStore.fetch()}>click</button>
		<div data-testid="view">{state.value}</div>
	</div>)
}
