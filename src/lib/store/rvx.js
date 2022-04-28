import utils from '@priolo/jon-utils';
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

/**
 * HOOK to use the STORE in React v18
 * @param {Store} store 
 * @returns {Object}
 */
export function useStore(store) {
	return useSyncExternalStore(
		store._subscribe,
		() => store.state
	)
}

/**
 * HOOK to use the STORE in React v17
 * @param {Store} store 
 * @returns {Object}
 */
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


/** @type {boolean} Indicates whether the last block of code was called internally at the store or not */
let _block_subcall = false

/**
 * create a STORE with a SETUP-STORE
 * @param {StoreSetup} setup 
 * @returns {Store}
 */
export function createStore(setup) {

	/**@type {Store} */
	let store = {

		// the current state of the store
		state: utils.cloneDeep(setup.state),

		// the listeners that are watching the store
		_listeners: new Set(),

		// add listener to the store
		_subscribe: (listener) => {
			store._listeners.add(listener)
			return () => store._listeners.delete(listener)
		},
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
		}, store)
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
			}
			return acc
		}, store)
	}

	/**
	 * MUTATORS
	 */
	if (setup.mutators) {
		store = Object.keys(setup.mutators).reduce((acc, key) => {
			acc[key] = payload => {
				const stub = setup.mutators[key](payload, store)
				// if the "mutator" returns "undefined" then I do nothing
				if (stub === undefined) return
				// to optimize check if there is any change and dispath on plugins
				if (Object.keys(stub).every(key => stub[key] === store.state[key])) return
				store.state = { ...store.state, ...stub }
				pluginEmit(EVENTS_TYPES.MUTATION, store, key, payload, null, _block_subcall)
				store._listeners.forEach(listener => listener(store.state))
			}
			return acc
		}, store)
	}

	return store
}