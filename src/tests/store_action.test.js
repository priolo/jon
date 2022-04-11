import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore, useStore} from '../lib/store/rvx'

/**
 * TEST riguardanti le ACTION dello STORE
 */

let myStore

beforeEach(() => {
	myStore = createStore({
		state: {
			value: "init value",
			responseValue: "",
		},
		actions: {
			fetch: async (state, _, store) => {
				// simulate http response
				await new Promise((res) => setTimeout(res, 100))
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
	})
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

	// wait for the state to be updated
	await new Promise( (res) => setTimeout(res, 200) )

	// verify if the value is updated
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

	// mi aspetto questo valore perche' "setValue" e "processValue" non sono sincronizzati
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
