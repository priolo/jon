import React, { useContext, useEffect, useState } from 'react';
import { createStore } from './rvx';
import { STORE_EVENTS } from './rvxUtils';


/**
 * Create in "setupStore"
 * DICTIONARY with All the CONTEXT contain the REDUCER of a STORE
 * are taken from the REACT components through a PROVIDER
 */
const contexts = {}	// [store name] 
/**
 * Create in "setupStore"
 * DICTIONARY with All the STORES
 */
const stores = {}	// [store name] 

/**
 * Adds a STORE in JON
 * @param {*} name name of the STORE to create
 * @param {*} setup his SETUP
 * @param {*} reducer its REDUCER (it must be a "useState" of the REACT component so it updates when it changes value)
 * @returns the context, accessible externally, which contains the "reducer"
 */
function addStore(name, setup, reducer, index = 0) {

	if (!contexts[name]) contexts[name] = []
	const context = React.createContext()
	context.displayName = index == 0 ? name : `${name}[${index}]`
	contexts[name][index] = context

	const store = stores[name] ?? createStore(setup)
	stores[name] = store
	store._reducers[index] = reducer

	updateWatch(name)
	return context
}

/**
 * Removes a STORE from JON
 *Useful for "dynamic" STORE
 * @param {*} name 
 */
function removeStore(name, index = 0) {
	updateWatch(name, true)
	// TODO: trovare una soluzione perche' questi non funzionano se siamo dentro NEXT
	// probabilmente perche' NEXT crea STORE e li distrugge in maniera non "coerente"
	//delete contexts[name][index]
	//delete stores[name][index]
}

/**
 * Creates/deletes the events defined in the SETUP "watch" in the STORE
 * @param {*} name Name of the STORE from which to create/remove the "watches"
 * @param {boolean} remove removes events if "true" otherwise creates them
 */
function updateWatch(name, remove = false) {
	const store = stores[name]
	if (!store || !store._watch) return

	// cycle all the STORE present in the "_watch" section
	for (const storeName of Object.keys(store._watch)) {
		const storeWatch = store._watch[storeName]
		const storeEmit = stores[storeName]
		if (!storeWatch || !storeEmit) continue
		// all the "mutators" of the STORE that must be "observed"
		for (const propName of Object.keys(storeWatch)) {
			// function to call when the event occurs
			const callbackWatch = storeWatch[propName]
			// create/delete the event
			const emitter = storeEmit.emitter
			if (remove) {
				emitter.off(STORE_EVENTS.MUTATION, callbackWatch)
			} else {
				emitter.on(STORE_EVENTS.MUTATION, callbackWatch)
			}

		}
	}
}

/**
 * Returns a STORE by its name
 * It is useful for using a STORE outside a REACT COMPONENT
 * @param {string} name 
*/
export function getStore(name) {
	const store = stores[name]
	return store
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
 * @param {*} name 
*/
export function useStore(name, index = 0) {
	const store = stores[name]
	const context = contexts[name][index]
	const reducer = useContext(context)
	store._reducers[index] = reducer
	return store
}

/**
 * REACT PROVIDER that contains all REDUCERS
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

	useEffect(() => {
		//stores[name]._reducers[index] = reducer
		stores[name]._init()
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
