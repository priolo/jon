import { obj } from '@priolo/jon-utils'
import { useEffect, useState, useSyncExternalStore, version } from 'react'
import { Store, StoreSetup, WatchCallback } from './global'
import { EVENTS_TYPES, pluginEmit } from "./rvxPlugin"

/** 
 * Indicates whether the last block of code was called internally at the store or not 
 */
let _block_subcall = false

/**
 * HOOK to use the STORE in React v18
 */
function useStore18(store: Store): any {
	return useSyncExternalStore(store._subscribe, () => store.state)
}

/**
 * HOOK to use the STORE in React v17
 */
function useStore17(store: Store): any {
	const [state, setState] = useState(store.state)

	useEffect(() => {
		const listener = (s:any) => {
			setState(s)
		}
		const unsubscribe = store._subscribe(listener)
		return unsubscribe
	}, [store])

	return state
}

export const useStore = version.slice(0,2)=="17" ? useStore17 : useStore18

/**
 * create a STORE with a SETUP-STORE
 */
export function createStore(setup: StoreSetup): Store {

	let store: Store = {
		// the current state of the store
		state: finalizeState(setup.state),

		// the listeners that are watching the store
		_listeners: new Set<WatchCallback>(),

		// add listener to the store. Called by "useSyncExternalStore"
		_subscribe: (listener) => {
			store._listeners.add(listener)
			return () => store._listeners.delete(listener)
		},

		_update: () => store._listeners.forEach(listener => listener(store.state)),
	}

	/**
	 * GETTERS
	 */
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = (payload) => {
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
	 * ACTION SYNC
	 * [II] Da eliminare
	 */
	if (setup.actionsSync) {
		store = Object.keys(setup.actionsSync).reduce((acc, key) => {
			acc[key] = (payload) => {
				const tmp = _block_subcall
				if (tmp == false) _block_subcall = true

				const result = setup.actionsSync[key](payload, store)

				pluginEmit(EVENTS_TYPES.ACTION_SYNC, store, key, payload, result, tmp)
				if (tmp == false) _block_subcall = false
				return result
			};
			return acc
		}, store)
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
				//store._listeners.forEach((listener) => listener(store.state));
				store._update()
			};
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
