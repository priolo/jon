import React, { useContext, useEffect, useState, useMemo } from 'react';
import { createStore } from './rvx';
import { options } from './rvxUtils';

/**
 * @typedef {import("./rvx").StoreSetup} StoreSetup
 * @typedef {import("./rvx").Store} Store
 */


/**
 * Create in "setupStore"
 * DICTIONARY with All the CONTEXT contain the REDUCER of a STORE
 * are taken from the REACT components through a PROVIDER
 */
const contexts = {}	// [store name] 

/**
 * Create in "setupStore"
 * DICTIONARY with All the STORES
 * @type {Object.<string, Store>}
 */
const stores = {}	// [store name] 

/**
 * Adds a STORE in JON
 * @param {string} name name of the STORE to create
 * @param {StoreSetup} setup his SETUP
 * @param {*} reducer its REDUCER (it must be a "useState" of the REACT component so it updates when it changes value)
 * @returns the context, accessible externally, which contains the "reducer"
 */
function addStore(name, setup, reducer, index = 0) {

	if (!contexts[name]) contexts[name] = []
	const context = React.createContext()
	context.displayName = index == 0 ? name : `${name}[${index}]`
	contexts[name][index] = context

	const store = stores[name] ?? createStore(setup, name)
	stores[name] = store
	store._reducers[index] = reducer
	store._init()

	return context
}

/**
 * Removes a STORE from JON
 * Useful for "dynamic" STORE
 * @param {string} name 
 * @returns {void}
 */
function removeStore(name, index = 0) {
	// TODO: trovare una soluzione perche' questi non funzionano se siamo dentro NEXT
	// probabilmente perche' NEXT crea STORE e li distrugge in maniera non "coerente"
	if (options.disableCheckNext == false && window.next) return
	//if ( options.env == ENVIROMENTS.NEXT ) return

	// elimono il CONTEXT con il nome-indice indicato
	contexts[name][index] = null
	// se non ci sono piu' CONTEXT allora elimino tutto
	if (contexts[name].every(ci => ci == null)) {
		const store = getStore(name)
		store._remove()
		delete contexts[name]
		delete stores[name]
	}
}

/**
 * Returns a STORE by its name
 * It is useful for using a STORE outside a REACT COMPONENT
 * @param {string} name 
 * @returns {Store}
*/
export function getStore(name) {
	const store = stores[name]
	return store
}

/**
 * Si insomma... restituisce tutti gli store
 * @returns {Store}
 */
export function getAllStores() {
	return stores
}

/**
 * Use a STORE by its name
 * It is useful for using a STORE in a REACT COMPONENT
 * @param {string} name 
 * @param {number} index
 * @returns {Store}
*/
export function useStore(name, index = 0) {
	const store = stores[name]
	if (!store) return null
	const context = contexts[name][index]
	if (!context) return null
	const reducer = useContext(context)
	// connect reducer
	if (reducer) store._reducers[index] = reducer
	return store
}

/**
 * REACT PROVIDER that contains all REDUCERS
 * @param { {setups: StoreSetup, children:any, index:number} } param0
 */
export const MultiStoreProvider = ({ setups: setupsCurr, children, index = 0 }) => {

	const names = Object.keys(setupsCurr)
	const name = names[0]
	const isNotLast = names.length > 1
	const setup = setupsCurr[name]
	const setupsChild = { ...setupsCurr }
	delete setupsChild[name]

	const reducer = useState(setup.state)
	const [context, setContext] = useState(() => addStore(name, setup, reducer, index))

	//useMemo(() => stores[name]._init(), [])

	useEffect(() => {
		////stores[name]._reducers[index] = reducer
		stores[name]._initAfter()
		return () => {
			removeStore(name, index)
		}
	}, [])

	

	return React.createElement(
		context.Provider,
		{ value: reducer },
		isNotLast ?
			React.createElement(MultiStoreProvider, {
				setups: setupsChild,
				children: children
			})
			: children
	)
}
