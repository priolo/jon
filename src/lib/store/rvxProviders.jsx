import React, { useContext, useEffect, useReducer, useState } from 'react';
import { getApplyStore, createStore, useApplyStore } from './rvx';
import { STORE_EVENTS } from './rvxUtils';


/**
 * Create in "setupStore"
 * DICTIONARY with All the SETUP used to create the STORE
 */
let setups = {}		// [store name] 
/**
 * Create in "setupStore"
 * DICTIONARY with All the CONTEXT contain the REDUCER of a STORE
 * are taken from the REACT components through a PROVIDER
 */
let contexts = {}	// [store name] 
/**
 * Create in "setupStore"
 * DICTIONARY with All the STORES
 */
let stores = {}	// [store name] 
/**
 * Create in "MultiStoreProvider"
 * DICTIONARY with all REDUCERS, are inside the CONTEXT
 */
const reducers = {}








/**
 * Initialization!
 * Create CONTEXTS and STORES from a SETUP-STORE dictionary
 * @param {*} stp SETUP-STORE dictionary
 */
export function setupStore(stp) {

	setups = stp

	contexts = Object.keys(setups).reduce((acc, storeName) => {
		acc[storeName] = React.createContext();
		acc[storeName].displayName = storeName
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

	const providersChild = [...providers]
	const provider = providersChild.shift();

	const redux = useState(setups[provider].state);
	reducers[provider] = redux
	const context = contexts[provider]


	// call init
	useEffect(() => {
		stores[provider]._reducer = reducers[provider]
		stores[provider]._init()
	}, [])

	return React.createElement(
		context.Provider,
		{ value: redux },
		providersChild.length > 0 ?
			React.createElement(MultiStoreProvider, {
				providers: providersChild,
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


/**
 * **************************************************************
 */

/**
 * REACT PROVIDER that contains SPECIFIC REDUCERS
 */

/**
 * Memorizza tutti gli store creati dynamicamente
 * [id]: { context, store }
 */
let storesDynamic = {}


/**
 * Componente REACT crea il CONTEXT e il PROVIDER del DYNAMIC-STORE
 */
export function StoreProvider({ setup, storeId, children }) {

	const [local, setLocal] = useState(null)
	const redux = useState(setup.state);

	useEffect(() => {
		const context = React.createContext(redux)
		setLocal(context)

		const store = createStore(setup)
		store._reducer = redux
		store._init()

		storesDynamic[storeId] = { store, context }

		return () => {
			delete storesDynamic[storeId]
		}
	}, [])

	return local && <local.Provider value={redux}>
		{children}
	</local.Provider>
}

/**
 * Restituisce lo STORE in un contensto HOOK
 * @param {*} id identificativo dello STORE
 * @returns STORE restituito
 */
export function useDynamicStore(id) {
	const { context, store } = storesDynamic[id]
	const reducer = useContext(context)
	store._reducer = reducer
	return store
}

/**
 * Restituisce lo store in un contesto fuori da REACT
 * @param {*} id identificativo dello STORE
 * @returns STORE restituito
 */
export function getDynamicStore(id) {
	const { store } = storesDynamic[id]
	return store
}



