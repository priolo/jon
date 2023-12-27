import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, useStoreNext } from '../lib/store/rvx'


let myStore

beforeEach(() => {
	myStore = createStore({
		state: () => ({
			value1: "init value1",
			value2: "init value2",
		}),
		getters: {
		},
		actions: {
		},
		mutators: {
			setValue1: (value1) => ({ value1 }),
			setValue2: (value2) => ({ value2 }),
		},
	})
})

describe("use store next function render", async () => {

	it('change only if!', async () => {

		render(<>
			<TestView />
			<TestCommand />
		</>)

		// change state value1 with event 
		await userEvent.click(screen.getByText('click1'))
		// effettivamente è cambiato "view1" !
		expect(screen.getByTestId('view1')).toHaveTextContent("new value1")
		// e mo proviamo con "click2"
		await userEvent.click(screen.getByText('click2'))
		// e questo non è cambiato... giusto!
		expect(screen.getByTestId('view2')).toHaveTextContent("init value2")

	})
})



function TestView() {
	const state = useStoreNext(myStore, (state, old) => {
		return state.value1 != old.value1
	})
	return <>
		<div data-testid="view1">{state.value1}</div>
		<div data-testid="view2">{state.value2}</div>
	</>
}

function TestCommand() {
	return <>
		<button onClick={() => myStore.setValue1("new value1")}>click1</button>
		<button onClick={() => myStore.setValue2("new value2")}>click2</button>
	</>
}
