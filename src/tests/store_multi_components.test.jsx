import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createStore, useStore } from '../lib/store/rvx'


const store = {
	state: ()=>({
		value: "init value",
	}),
	actions: {
		act: async (value, store) => {
			store.setValue(`value: ${value}`)
		},
		actMulti: async ({ value, index }, store) => {
			store.setValue(`multi_value: ${value}`)
			myStores[index].act(`multi-${value}`)
		},
		actFromAnotherStore: async (index, store) => {
			const anotherStore = myStores[index]
			const { state:anotherState} = anotherStore
			store.act(anotherState.value)
		}
	},
	mutators: {
		setValue: (value) => {
			return { value }
		},
	},
}
let myStores

beforeEach(() => {
	myStores = [
		createStore(store),
		createStore(store),
	]
})


test('two different STORE in two VIEW', async () => {

	render(<>
		<TestView index={0}/>
		<TestView index={1}/>
	</>)

	await act(async () => await myStores[0].act("code-0"))
	fireEvent.click(screen.getByText('click1'))
	await waitFor(() => expect(screen.getByTestId('view_0')).toHaveTextContent("value: code-0"))
	await waitFor(() => expect(screen.getByTestId('view_1')).toHaveTextContent("value: click-1"))

	await act(async () => await myStores[0].actMulti({value: "code-0", index: 1}))
	await waitFor(() => expect(screen.getByTestId('view_0')).toHaveTextContent("multi_value: code-0"))
	await waitFor(() => expect(screen.getByTestId('view_1')).toHaveTextContent("value: multi-code-0"))

	await act(async () => await myStores[1].actFromAnotherStore(0))
	await waitFor(() => expect(screen.getByTestId('view_1')).toHaveTextContent("value: multi_value: code-0"))

	//screen.debug()
})

function TestView({ index }) {

	const state = useStore(myStores[index])
	const store = myStores[index]

	return (<div>
		<button onClick={() => store.act(`click-${index}`)}>click{index}</button>
		<div data-testid={`view_${index}`}>{state.value}</div>
	</div>)
}
