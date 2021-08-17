import React, { useContext, useEffect, useState } from 'react';
import { createStore } from './rvx';
import { STORE_EVENTS } from './rvxUtils';


/**
 * Create in "setupStore"
 * DICTIONARY with All the SETUPS used to create the STORE
 */
const setups = {}	// [store name] 
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
 * Create in "MultiStoreProvider"
 * DICTIONARY with all REDUCERS, are inside the CONTEXT
 */
const reducers = {}



/**
 * Adds a STORE in JON
 * @param {*} name name of the STORE to create
 * @param {*} setup his SETUP
 * @param {*} reducer its REDUCER (it must be a "useState" of the REACT component so it updates when it changes value)
 * @returns the context, accessible externally, which contains the "reducer"
 */
function addStore(name, setup, reducer) {
	//if (setups[name]) console.error(`ERROR:store:add:duplicate_name:${name}`)

	setups[name] = setup

	const context = React.createContext(reducer)
	context.displayName = name
	contexts[name] = context

	const store = createStore(setup)
	stores[name] = store
	store._reducer = reducer

	reducers[name] = reducer

	updateWatch(name)

	return context
}

/**
 * Removes a STORE from JON
 *Useful for "dynamic" STORE
 * @param {*} name 
 */
function removeStore(name) {
	updateWatch(name, true)
	//delete setups[name]
	//delete contexts[name]
	//delete stores[name]
	delete reducers[name]
}

/**
 * Creates/deletes the events defined in the SETUP "watch" in the STORE
 * @param {*} name Name of the STORE from which to create/remove the "watches"
 * @param {boolean} remove removes events if "true" otherwise creates them
 */
function updateWatch(name, remove=false) {
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
			if ( remove ) {
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
	// const reducer = reducers[name]
	// store._reducer = reducer
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
export function useStore(name) {
	const store = stores[name]
	const context = contexts[name]
	const reducer = useContext(context)
	store._reducer = reducer
	return store
}

/**
 * REACT PROVIDER that contains all REDUCERS
 */
export const MultiStoreProvider = ({ setups, children }) => {

	const names = Object.keys(setups)
	const name = names[0]
	const isNotLast = names.length > 1
	const setup = setups[name]
	const setupsChild = { ...setups }
	delete setupsChild[name]

	const reducer = useState(setup.state)
	const [context, setContext] = useState(() => addStore(name, setup, reducer))

	useEffect(() => {
		stores[name]._reducer = reducers[name]
		stores[name]._init()
		return () => {
			removeStore(name)
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
