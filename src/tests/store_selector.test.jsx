import { act, render, screen } from '@testing-library/react'
import { createStore, useStore } from '../lib/store/rvx'
import React from 'react'

describe('useStore with selector', () => {
    it('should select a slice of state and avoid unnecessary re-renders', () => {
        const store = createStore({
            state: { count: 0, text: 'hello' },
            mutators: {
                inc: (amount, store) => ({ count: store.state.count + amount }),
                setText: (text) => ({ text })
            }
        })

        let renderCount = 0

        function Counter() {
            const count = useStore(store, state => state.count)
            renderCount++
            return <div data-testid="count">{count}</div>
        }

        render(<Counter />)

        expect(screen.getByTestId('count')).toHaveTextContent('0')
        expect(renderCount).toBe(1)

        // Update selected state -> should re-render
        act(() => {
            store.inc(1)
        })

        expect(screen.getByTestId('count')).toHaveTextContent('1')
        expect(renderCount).toBe(2)

        // Update unrelated state -> should NOT re-render
        act(() => {
            store.setText('world')
        })

        expect(screen.getByTestId('count')).toHaveTextContent('1')
        expect(renderCount).toBe(2)
    })

    it('should work without selector (backward compatibility)', () => {
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

    it('test33333', () => {
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
            useStore(myStore, state => state.text)
            useStore(myStore, state => state.count)
            //useStore(myStore)
            renderCount++
            return <div data-testid="count">{myStore.state.count}</div>
        }
        render(<Counter />)

        // Update selected state -> should re-render
        act(() => {
            myStore.setText("pippo")
        })

        expect(renderCount).toBe(1)
    })
})
