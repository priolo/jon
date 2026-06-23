import { render, screen, act } from '@testing-library/react'
import { createStore, useStore } from '../lib/store/rvx_juice'
import { storeToTools } from '../lib/store/rvx_tools'


let store
let tools

beforeEach(() => {
	store = createStore({
		state: { count: 0 },
		actions: {
			incBy: async (amount, s) => {
				s.setCount(s.state.count + amount)
				return s.state.count
			},
		},
		mutators: {
			setCount: (count) => ({ count }),
		},
	})

	tools = storeToTools(store, [
		{
			name: 'setCount',
			description: 'Set the counter',
			parameters: { type: 'object', properties: { count: { type: 'number' } }, required: ['count'] },
			map: (a) => a.count,
		},
		{
			name: 'incBy',
			description: 'Increment the counter',
			parameters: { type: 'object', properties: { amount: { type: 'number' } }, required: ['amount'] },
			map: (a) => a.amount,
		},
	])
})


describe('storeToTools', () => {

	it('exposes one function declaration per tool', () => {
		expect(tools.functionDeclarations.map((d) => d.name)).toEqual(['setCount', 'incBy'])
		expect(tools.functionDeclarations[0].parameters.required).toEqual(['count'])
	})

	it('dispatch executes a mutator tool call and mutates the store', async () => {
		// simulates what model.functionCalls() returns
		const res = await tools.dispatch({ name: 'setCount', args: { count: 7 } })

		expect(store.state.count).toBe(7)
		// result wrapped in the Gemini-shaped functionResponse
		expect(res.functionResponse.name).toBe('setCount')
	})

	it('dispatch awaits an async action and returns its result', async () => {
		await tools.dispatch({ name: 'setCount', args: { count: 10 } })
		const res = await tools.dispatch({ name: 'incBy', args: { amount: 5 } })

		expect(store.state.count).toBe(15)
		expect(res.functionResponse.response.result).toBe(15)
	})

	it('throws on an unknown tool', async () => {
		await expect(tools.dispatch({ name: 'ghost', args: {} })).rejects.toThrow(/Unknown tool/)
	})

	it('a tool call re-renders subscribed components (the reactive loop)', async () => {
		function View() {
			const state = useStore(store)
			return <div data-testid="count">{state.count}</div>
		}
		render(<View />)
		expect(screen.getByTestId('count')).toHaveTextContent('0')

		// the "agent" calls a tool -> store mutates -> UI updates
		await act(async () => {
			await tools.dispatch({ name: 'incBy', args: { amount: 3 } })
		})

		expect(screen.getByTestId('count')).toHaveTextContent('3')
	})
})
