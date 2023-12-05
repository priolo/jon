import { obj } from '@priolo/jon-utils'
import { useEffect, useState, useSyncExternalStore, version } from 'react'
import { FnConditionalRendering, ReducerCallback, StoreCore, StoreSetup, WatchCallback } from './global'
import { EVENTS_TYPES, pluginEmit } from "./rvxPlugin"

/** 
 * Indicates whether the last block of code was called internally at the store or not 
 */
let _block_subcall = false

/**
 * HOOK to use the STORE in React v18
 */
function useStore18<T>(store: StoreCore<T>): T {
	return useSyncExternalStore(store._subscribe, () => store.state)
}

/**
 * HOOK to use the STORE in React v17
 */
function useStore17<T>(store: StoreCore<T>): T {
	const [state, setState] = useState(store.state)

	useEffect(() => {
		const listener = (s: any) => {
			setState(s)
		}
		const unsubscribe = store._subscribe(listener)
		return unsubscribe
	}, [store])

	return state
}

export const useStore = version.slice(0, 2) == "17" ? useStore17 : useStore18

export function useStoreNext<T>(store: StoreCore<T>, fn?: FnConditionalRendering): T {
	return useSyncExternalStore((listener) => store._subscribe(listener, fn), () => store.state)
}

/**
 * create a STORE with a SETUP-STORE
 */
export function createStore<T>(setup: StoreSetup<T>): StoreCore<T> {

	let store: StoreCore<T> = {
		// the current state of the store
		state: finalizeState(setup.state),

		// the listeners that are watching the store
		_listeners: new Set<ReducerCallback>(),

		// add listener to the store. Called by "useSyncExternalStore"
		_subscribe: (listener, fn) => {
			listener.fn = fn
			store._listeners.add(listener)
			return () => store._listeners.delete(listener)
		},

		_update: () => {
			const oldState = store.state
			store.state = { ...store.state }
			for (const listener of store._listeners) {
				if (!listener.fn || listener.fn(store.state, oldState)) listener(store.state)
			}
		},
	}

	/**
	 * GETTERS
	 */
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = (payload: any) => {
				return setup.getters[key](payload, store)
			}
			return acc
		}, store)
	}

	/**
	 * ACTIONS
	 */
	if (setup.actions) {
		store = Object.keys(setup.actions).reduce((acc, key) => {
			acc[key] = async (payload) => {
				const tmp = _block_subcall
				if (tmp == false) _block_subcall = true

				const result = await setup.actions[key](payload, store)

				pluginEmit(EVENTS_TYPES.ACTION, store, key, payload, result, tmp)
				if (tmp == false) _block_subcall = false
				return result
			}
			return acc
		}, store);
	}

	/**
	 * MUTATORS
	 */
	if (setup.mutators) {
		store = Object.keys(setup.mutators).reduce((acc, key) => {
			acc[key] = (payload) => {
				const stub = setup.mutators[key](payload, store)
				// if the "mutator" returns "undefined" then I do nothing
				if (stub === undefined) return
				// to optimize check if there is any change and dispath on plugins
				if (Object.keys(stub).every((key) => stub[key] === store.state[key])) return
				store.state = { ...store.state, ...stub }
				pluginEmit(
					EVENTS_TYPES.MUTATION,
					store,
					key,
					payload,
					null,
					_block_subcall
				)
				// send reaction 
				store._listeners.forEach((listener) => listener(store.state));
			}
			return acc
		}, store)
	}

	return store
}

/**
 * Estrapola il valore di uno "state"
 */
export function finalizeState(state: any): any {
	if (!state) return {};
	return typeof state === "function" ? state() : obj.cloneDeep(state);
}
