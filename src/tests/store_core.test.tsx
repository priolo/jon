import { act, render } from '@testing-library/react'
import { createStore, useStore } from '../lib/store/rvx'
import { addWatch, removeWatch } from '../lib/store/rvxPlugin'
import { LISTENER_CHANGE } from '../lib/store/global'

/**
 * TEST sui rami "nascosti" del core: update saltati, clonazione dello stato
 * iniziale, hook di lifecycle e rimozione selettiva dei watcher.
 */

describe('mutator update is skipped', () => {

	it('does not re-render or emit when the mutator returns undefined', () => {
		const store = createStore({
			state: { count: 0 },
			mutators: {
				noop: () => undefined,
				setCount: (count: number) => ({ count }),
			},
		})
		const events = vi.fn()
		addWatch({ store, actionName: '*', callback: events })

		let renders = 0
		function View() { useStore(store); renders++; return null }
		render(<View />)
		expect(renders).toBe(1)

		act(() => store.noop())

		expect(renders).toBe(1)            // nessun re-render
		expect(events).not.toHaveBeenCalled() // nessun evento plugin
		expect(store.state.count).toBe(0)

		removeWatch({ store })
	})

	it('does not re-render or emit when the returned values equal the current state', () => {
		const store = createStore({
			state: { count: 0 },
			mutators: { setCount: (count: number) => ({ count }) },
		})
		const events = vi.fn()
		addWatch({ store, actionName: '*', callback: events })

		let renders = 0
		function View() { useStore(store); renders++; return null }
		render(<View />)

		act(() => store.setCount(0)) // stesso valore -> saltato
		expect(renders).toBe(1)
		expect(events).not.toHaveBeenCalled()

		act(() => store.setCount(1)) // cambiamento reale -> aggiorna
		expect(renders).toBe(2)
		expect(events).toHaveBeenCalledTimes(1)

		removeWatch({ store })
	})
})

describe('initial state handling', () => {

	it('deep-clones a plain-object state so the store does not share references', () => {
		const initial = { value: 'a', nested: { n: 1 } }
		const store = createStore({
			state: initial,
			mutators: { setValue: (value: string) => ({ value }) },
		})

		expect(store.state).not.toBe(initial)
		expect(store.state.nested).not.toBe(initial.nested)

		// mutare l'oggetto originale non tocca lo stato dello store
		initial.nested.n = 99
		expect(store.state.nested.n).toBe(1)
	})

	it('uses a state factory result as-is (no clone)', () => {
		const shared = { n: 1 }
		const store = createStore({ state: () => ({ ref: shared }) })
		expect(store.state.ref).toBe(shared)
	})
})

describe('lifecycle hooks', () => {

	it('onStateChange receives the updated store and the previous state', () => {
		let captured: { current: string; previous: string } | null = null
		const store = createStore({
			state: { value: 'a' },
			mutators: { setValue: (value: string) => ({ value }) },
			onStateChange: (s, oldState) => {
				captured = { current: s.state.value, previous: oldState.value }
			},
		})

		store.setValue('b')

		expect(captured).toEqual({ current: 'b', previous: 'a' })
	})

	it('onListenerChange fires ADD on subscribe and REMOVE on unsubscribe', () => {
		const events: LISTENER_CHANGE[] = []
		const store = createStore({
			state: { value: 0 },
			onListenerChange: (_s, type) => events.push(type),
		})

		function View() { useStore(store); return null }
		const { unmount } = render(<View />)
		expect(events).toEqual([LISTENER_CHANGE.ADD])

		unmount()
		expect(events).toEqual([LISTENER_CHANGE.ADD, LISTENER_CHANGE.REMOVE])
	})
})

describe('removeWatch is selective', () => {

	it('removes only the watchers for the given actionName', () => {
		const store = createStore({
			state: { a: 0, b: 0 },
			mutators: { setA: (a: number) => ({ a }), setB: (b: number) => ({ b }) },
		})
		const cbA = vi.fn()
		const cbB = vi.fn()
		addWatch({ store, actionName: 'setA', callback: cbA })
		addWatch({ store, actionName: 'setB', callback: cbB })

		removeWatch({ store, actionName: 'setA' })

		store.setA(1)
		store.setB(1)
		expect(cbA).not.toHaveBeenCalled()
		expect(cbB).toHaveBeenCalledTimes(1)

		removeWatch({ store })
	})

	it('removes only the given callback for an actionName', () => {
		const store = createStore({
			state: { a: 0 },
			mutators: { setA: (a: number) => ({ a }) },
		})
		const cb1 = vi.fn()
		const cb2 = vi.fn()
		addWatch({ store, actionName: 'setA', callback: cb1 })
		addWatch({ store, actionName: 'setA', callback: cb2 })

		removeWatch({ store, actionName: 'setA', callback: cb1 })

		store.setA(1)
		expect(cb1).not.toHaveBeenCalled()
		expect(cb2).toHaveBeenCalledTimes(1)

		removeWatch({ store })
	})
})
