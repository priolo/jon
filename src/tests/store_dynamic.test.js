import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, useStore } from '../lib/store/rvxProviders'



const setupMyStore = {
	state: {
		value: "init value",
	},
	actions: {
		fetch: async (state, payload, store) => {
			// simulate http response
			await new Promise((res) => setTimeout(res, 1000))
			store.setValue("new value")
		}
	},
	mutators: {
		setValue: (state, value) => {
			return { value }
		},
	},
}

test('due diversi STORE con lo stesso SETUP in due diverse VIEW', async () => {

	render(<>
		<MultiStoreProvider setups={{ pippo: setupMyStore }}>
			<TestView storeName="pippo" />
		</MultiStoreProvider>
		<MultiStoreProvider setups={{ topolino: setupMyStore }}>
			<TestView storeName="topolino" />
		</MultiStoreProvider>
	</>)

	// change state value with reducer
	const { fetch } = getStore("pippo")
	await act(async () => fetch())

	//screen.debug()

	expect(screen.getByTestId('view_pippo')).toHaveTextContent("new value")
	expect(screen.getByTestId('view_topolino')).toHaveTextContent("init value")
})

function TestView({ storeName }) {

	const { state, fetch } = useStore(storeName)

	return (<div>
		<button onClick={() => fetch()}>click</button>
		<div data-testid={`view_${storeName}`}>{state.value}</div>
	</div>)
}


