import { useEffect, useState, useSyncExternalStore } from 'react';
import { EVENTS_TYPES, pluginEmit } from "./rvxPlugin";

//#region TYPEDEF

/**
 * @typedef {import("./rvxPlugin").Listener} Listener
 */

/**
 * @typedef {(state:Object, props:Object, store:Store)=>Object} CallStoreSetup
 * @typedef {(props:Object)=>Object} CallStore
  */

/**
 * @typedef {Object} StoreSetup 
 * @property  {Object} state
 * @property  {Object.<string,CallStoreSetup>} getters
 * @property  {Object.<string,CallStoreSetup>} actions
 * @property  {Object.<string,CallStoreSetup>} actionsSync
 * @property  {Object.<string,CallStoreSetup>} mutators
 */

/**
 * @typedef {Object} Store
 * @property {Object} state
 * @property {...Object.<string, CallStore>}
 */

//#endregion


export function useStore(store) {
	return useSyncExternalStore(
		store._subscribe,
		() => store.state
	)
}

export function useStore17(store) {
	const [state, setState] = useState(store.state)

	useEffect(() => {
		const listener = (s) => {
			setState(s)
		}
		const unsubscribe = store._subscribe(listener)
		return unsubscribe
	}, [store])

	return state
}


/**@type {boolean} Indicates whether the last block of code was called internally at the store or not */
let _block_subcall = false

/**
 * create a STORE with a SETUP-STORE
 * @param {StoreSetup} setup 
 * @returns {Store}
 */
export function createStore(setup, name) {

	/**@type {Store} */
	let store = {

		// [II] clonare
		state: setup.state,

		// the listeners that are watching the store
		_listeners: new Set(),

		// add listener to the store
		_subscribe: (listener) => {
			store._listeners.add(listener)
			return () => store._listeners.delete(listener)
		},

		/**
		 * Called by the MUTATOR to make a change to the STATE
		 * @param {(state:Object)=>Object} fn reducer (oldState) => newState 
		 */
		_dispatchReducer: (fn) => {
			const state = fn(store.state)
			if (state == null) return
			store.state = state
			store._listeners.forEach(listener => listener(store.state))
		},
	}

	/**
	 * GETTERS
	 */
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = (payload) => {
				return setup.getters[key](store.state, payload, store)
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

				const result = await setup.actions[key](store.state, payload, store)

				pluginEmit(EVENTS_TYPES.ACTION, store, key, payload, result, tmp)
				if (tmp == false) _block_subcall = false
				return result
			}
			return acc
		}, store)
	}

	/**
	 * ACTION SYNC
	 */
	if (setup.actionsSync) {
		store = Object.keys(setup.actionsSync).reduce((acc, key) => {
			acc[key] = (payload) => {
				const tmp = _block_subcall
				if (tmp == false) _block_subcall = true

				const result = setup.actionsSync[key](store.state, payload, store)

				pluginEmit(EVENTS_TYPES.ACTION_SYNC, store, key, payload, result, tmp)
				if (tmp == false) _block_subcall = false
				return result
			}
			return acc
		}, store)
	}

	/**
	 * MUTATORS
	 */
	if (setup.mutators) {
		store = Object.keys(setup.mutators).reduce((acc, key) => {
			acc[key] = payload => store._dispatchReducer(state => {
				const stub = setup.mutators[key](state, payload, store)
				// if the "mutator" returns "null" then I do nothing
				if (stub == null) return null
				// to optimize check if there is any change and dispath on plugins
				if (Object.keys(stub).every(key => stub[key] == state[key])) return null

				state = { ...state, ...stub }
				pluginEmit(EVENTS_TYPES.MUTATION, store, key, payload, null, _block_subcall)
				return state
			})
			return acc
		}, store)
	}

	return store
}

