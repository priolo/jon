import React, { useContext, useEffect, useState, useMemo } from 'react';
import { createStore } from './rvx';
import { STORE_EVENTS, options } from './rvxUtils';

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

	addWatch(name)
	return context
}

/**
 * Removes a STORE from JON
 *Useful for "dynamic" STORE
 * @param {*} name 
 */
function removeStore(name, index = 0) {
	// TODO: trovare una soluzione perche' questi non funzionano se siamo dentro NEXT
	// probabilmente perche' NEXT crea STORE e li distrugge in maniera non "coerente"
	if (options.disableCheckNext == false && window.next) return
	//if ( options.env == ENVIROMENTS.NEXT ) return

	contexts[name][index] = null
	if (contexts[name].every(ci => ci == null)) {
		//stores[name].emitter.off()
		removeWatch(name)
		delete contexts[name]
		delete stores[name]
	}
}

/**
 * [ { listener:<string>, source:<string> } ...]
 */
let watchLinks = []

function addWatch(listener) {
	const storeListener = stores[listener]
	if (!storeListener) return
	if (storeListener._watch) {
		for (const source in storeListener._watch) {
			watchLinks.push({ listener, source })
		}
	}
	watchLinksUpdate()
}

function removeWatch(listener) {
	const storeListener = stores[listener]
	if (!storeListener) return
	// tolgo dai temporanei
	watchLinks = watchLinks.filter(l => l.source != listener && l.listener != listener)
	// elimino gli eventi se ci sono
	if (!storeListener._watch) return
	for (const source in storeListener._watch) {
		const storeSource = stores[source]
		if (!storeSource) continue
		const callbacks = storeListener._watch[source]
		for (const callback of Object.values(callbacks)) {
			storeSource.emitter.off(STORE_EVENTS.MUTATION, callback)
		}
	}
}

function watchLinksUpdate() {
	const tmpLinks = []
	for (const link of watchLinks) {
		if (!watchLinkCreate(link)) tmpLinks.push(link)
	}
	watchLinks = tmpLinks
}

function watchLinkCreate(link) {
	const { source, listener } = link

	const storeListener = stores[listener]
	if (!storeListener || !storeListener._watch) return false
	const callbacks = storeListener._watch[source]
	if (!callbacks) return null

	const storeSource = stores[source]
	if (!storeSource) return false
	const emitter = storeSource.emitter

	for (const propName in callbacks) {
		const callback = callbacks[propName]
		emitter.on(STORE_EVENTS.MUTATION, callback)
	}
	return true
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
		////stores[name]._reducers[index] = reducer
		//stores[name]._init()
		return () => {
			removeStore(name, index)
		}
	}, [])

	useMemo(() => stores[name]._init(), [])

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
