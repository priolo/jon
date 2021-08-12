import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getDynamicStore, StoreProvider, useDynamicStore } from '../lib/store/rvxProviders'






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


test('simply getStore', async () => {

	render(<>
		<StoreProvider setup={setupMyStore} storeId="pippo">
			<TestView storeId="pippo"/>
		</StoreProvider>
		<StoreProvider setup={setupMyStore} storeId="topolino">
			<TestView storeId="topolino"/>
		</StoreProvider>
	</>)

	// change state value with reducer
	const store = getDynamicStore("pippo")
	await act(async () => store.fetch())

	expect(screen.getByTestId('view_pippo')).toHaveTextContent("new value")
	expect(screen.getByTestId('view_topolino')).toHaveTextContent("init value")
})

function TestView( {storeId} ) {

	const { state, fetch } = useDynamicStore(storeId)

	return (<div>
		<button onClick={() => fetch()}>click</button>
		<div data-testid={`view_${storeId}`}>{state.value}</div>
	</div>)
}


