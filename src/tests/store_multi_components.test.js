import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, useStore } from '../lib/store/rvxProviders'



test('same STORE in two different VIEW', async () => {

	render(<>
		<MultiStoreProvider setups={{ pippo: setupMyStore }} index={0}>
			<TestView storeName="pippo" index={0}/>
		</MultiStoreProvider>
		<MultiStoreProvider setups={{ pippo: setupMyStore }} index={1}>
			<TestView storeName="pippo" index={1}/>
		</MultiStoreProvider>
	</>)

	const { fetch } = getStore("pippo")
	await act(async () => await fetch("(get0)"))
	await waitFor(() => expect(screen.getByTestId('view_pippo_0')).toHaveTextContent("new value (get0)"))
	await waitFor(() => expect(screen.getByTestId('view_pippo_1')).toHaveTextContent("new value (get0)"))
	
	const { fetch:fetch1 } = getStore("pippo", 1)
	await act(async () => await fetch1("(get1)"))
	await waitFor(() => expect(screen.getByTestId('view_pippo_0')).toHaveTextContent("new value (get1)"))
	await waitFor(() => expect(screen.getByTestId('view_pippo_1')).toHaveTextContent("new value (get1)"))

	fireEvent.click(screen.getByText('click1'))
	await waitFor(() => expect(screen.getByTestId('view_pippo_0')).toHaveTextContent("new value (use1)"))
	await waitFor(() => expect(screen.getByTestId('view_pippo_1')).toHaveTextContent("new value (use1)"))
})

function TestView({ storeName, index }) {

	const { state, fetch } = useStore(storeName, index)

	return (<div>
		<button onClick={() => fetch(`(use${index})`)}>click{index}</button>
		<div data-testid={`view_${storeName}_${index}`}>{state.value}</div>
	</div>)
}

const setupMyStore = {
	state: {
		value: "init value",
	},
	actions: {
		fetch: async (state, post, store) => {
			store.setValue(`new value ${post}`)
		}
	},
	mutators: {
		setValue: (state, value) => {
			return { value }
		},
	},
}
