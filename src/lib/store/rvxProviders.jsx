import React, { useEffect, useReducer } from 'react';
import { getApplyStore, createStore, useApplyStore } from './rvx';
import { STORE_EVENTS } from './rvxUtils';


/**
 * Create in "setupStore"
 * All the SETUP used to create the STORE
 */
let setups
/**
 * Create in "setupStore"
 * All the CONTEXT contain the REDUCER of a STORE
 * are taken from the REACT components through a PROVIDER
 */
let contexts
/**
 * Create in "setupStore"
 * All the STORES
 */
let stores
/**
 * Create in "MultiStoreProvider"
 * all REDUCERS, are inside the CONTEXT
 */
const reducers = {}
const reducer = (state, action) => {
	return action(state);
};







/**
 * Initialization!
 * Create CONTEXTS and STORES from a SETUP-STORE dictionary
 * @param {*} stp SETUP-STORE dictionary
 */
export function setupStore(stp) {

	setups = stp

	contexts = Object.keys(setups).reduce((acc, p) => {
		acc[p] = React.createContext();
		acc[p].displayName = p
		return acc
	}, {})

	stores = Object.keys(setups).reduce((acc, storeName) => {
		acc[storeName] = createStore(setups[storeName]);
		return acc
	}, {})

	for (const storeName of Object.keys(setups)) {
		const store = stores[storeName]
		const setup = setups[storeName]
		createWatch(setup, store)
	}
}

/**
 * in base al parametro "watch" del SETUP
 * creo nello STORE gli eventi per intercettare una modifica e gestirla
 * @param {*} setup 
 * @param {*} store 
 */
function createWatch(setup, store) {
	if (!setup || !setup.watch || !store) return
	for (const storeName of Object.keys(setup.watch)) {
		const storeWatch = setup.watch[storeName]
		if (!storeWatch) continue
		for (const propName of Object.keys(storeWatch)) {
			const callbackWatch = storeWatch[propName]
			const storeEmitter = stores[storeName].emitter
			storeEmitter.on(STORE_EVENTS.MUTATION, e => {
				if (e.payload.key != propName) return
				callbackWatch(store, e.payload.payload)
			})
		}
	}
}



/**
 * REACT PROVIDER that contains all REDUCERS
 */
export const MultiStoreProvider = ({ providers, children }) => {

	if (providers == null) providers = Object.keys(setups)

	const prvs_c = [...providers]
	const provider = prvs_c.shift();

	const redux = useReducer(reducer, setups[provider].state);
	reducers[provider] = redux
	const context = contexts[provider]

	// return (<context.Provider value={redux}>
	// 	{prvs_c.length > 0 ? (
	// 		<MultiStoreProvider providers={prvs_c} children={children} />
	// 	) : (
	// 		children
	// 	)}
	// </context.Provider>)

	// call init
	useEffect(() => {
		stores[provider]._reducer = reducers[provider]
		stores[provider]._init()
	}, [])

	return React.createElement(
		context.Provider,
		{ value: redux },
		prvs_c.length > 0 ?
			React.createElement(MultiStoreProvider, {
				providers: prvs_c,
				children: children
			})
			: children
	)
}



/**
 * Returns a STORE by its name
 * It is useful for using a STORE outside a REACT COMPONENT
 * @param {string} storeName 
*/
export function getStore(storeName) {
	return getApplyStore(stores[storeName], reducers[storeName])
}

/**
 * Si insomma... restituisce tutti gli store
 * @returns 
 */
export function getAllStores() {
	return stores
}

/**
 * Use a STORE by its name
 * It is useful for using a STORE in a REACT COMPONENT
 * @param {*} storeName 
*/
export function useStore(storeName) {
	return useApplyStore(stores[storeName], contexts[storeName])
}