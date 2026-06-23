import { act, render, screen } from '@testing-library/react'
import { createStore, useStore } from '../lib/store/rvx'
import React from 'react'

// `useStore(store, fn)` ora usa un PREDICATO di rendering `(state, oldState) => boolean`
// (ex `useStoreNext`): ritorna l'intero stato e ri-renderizza solo quando `fn` torna true.
// Non esiste piu' una API a "selettore" che ritorna una slice.
describe('useStore with conditional render', () => {
    it('should re-render only when the watched slice changes', () => {
        const store = createStore({
            state: { count: 0, text: 'hello' },
            mutators: {
                inc: (amount, store) => ({ count: store.state.count + amount }),
                setText: (text) => ({ text })
            }
        })

        let renderCount = 0

        function Counter() {
            const state = useStore(store, (s, old) => s.count !== old.count)
            renderCount++
            return <div data-testid="count">{state.count}</div>
        }

        render(<Counter />)

        expect(screen.getByTestId('count')).toHaveTextContent('0')
        expect(renderCount).toBe(1)

        // Update watched slice (count) -> should re-render
        act(() => {
            store.inc(1)
        })

        expect(screen.getByTestId('count')).toHaveTextContent('1')
        expect(renderCount).toBe(2)

        // Update unrelated slice (text) -> should NOT re-render
        act(() => {
            store.setText('world')
        })

        expect(screen.getByTestId('count')).toHaveTextContent('1')
        expect(renderCount).toBe(2)
    })

    it('should re-render on every update without a predicate', () => {
        const store = createStore({
            state: { count: 10 },
            mutators: {
                inc: (amount, store) => ({ count: store.state.count + amount }),
            }
        })

        function Counter() {
            const state = useStore(store)
            return <div data-testid="count-full">{state.count}</div>
        }

        render(<Counter />)
        expect(screen.getByTestId('count-full')).toHaveTextContent('10')

        act(() => {
            store.inc(5)
        })
        expect(screen.getByTestId('count-full')).toHaveTextContent('15')
    })

    it('re-renders once when one of several watched slices changes', () => {
        const myStore = createStore({
            state: {
                text: "init value",
                count: 0,
            },
            mutators: {
                setText: text => ({ text }),
                setCount: count => ({ count }),
            },
        })

        let renderCount = 0

        function Counter() {
            useStore(myStore, (s, old) => s.text !== old.text)
            useStore(myStore, (s, old) => s.count !== old.count)
            renderCount++
            return <div data-testid="count">{myStore.state.count}</div>
        }
        render(<Counter />)
        expect(renderCount).toBe(1)

        // Changing `text` triggers only the text predicate -> a single re-render
        act(() => {
            myStore.setText("pippo")
        })
        expect(renderCount).toBe(2)

        // Changing `count` triggers only the count predicate -> one more re-render
        act(() => {
            myStore.setCount(5)
        })
        expect(renderCount).toBe(3)
    })
})
