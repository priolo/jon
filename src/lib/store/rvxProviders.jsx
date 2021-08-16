import React, { useContext, useEffect, useState } from 'react';
import { createStore } from './rvx';
import { STORE_EVENTS } from './rvxUtils';


/**
 * Create in "setupStore"
 * DICTIONARY with All the SETUP used to create the STORE
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
 * Aggiunge uno STORE in JON 
 * @param {*} name nome dello STORE da creare
 * @param {*} setup il suo SETUP
 * @param {*} reducer il suo REDUCER (deve essere un "useState" interno al componente REACT cosi' il componente è aggiornato quando cambia il valore)
 * @returns il context, accessibile, che contiene il "reducer" 
 */
function addStore(name, setup, reducer) {
	if (setups[name]) console.error(`ERROR:store:add:duplicate_name:${name}`)

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
 * Rimuove uno STORE da JON
 * Questo è utile per gli STORE "dinamici"
 * @param {*} name 
 */
function removeStore(name) {
	updateWatch(name, true)
	delete setups[name]
	delete contexts[name]
	delete stores[name]
}

/**
 * in base al parametro "watch" del SETUP
 * creo o elimino nello STORE gli eventi per intercettare la modifica ad una specifica mutation
 * @param {*} name Nome dello STORE da cui creare/rimuovere i "watch" 
 * @param {boolean} remove se true indica che l'intento è di rimuovere i watch altrimenti è di aggiungere
 */
function updateWatch(name, remove=false) {
	const store = stores[name]
	if (!store || !store._watch) return

	// ciclo tutti gli STORE presenti nella sezione "_watch"
	for (const storeName of Object.keys(store._watch)) {
		const storeWatch = store._watch[storeName]
		const storeEmit = stores[storeName]
		if (!storeWatch || !storeEmit) continue
		// di questo STORE ciclo tutte le "props" dello "state" che devono essere "osservate"
		for (const propName of Object.keys(storeWatch)) {
			// funzione da chiamare quando si verifica l'evento
			const callbackWatch = storeWatch[propName]
			// inserirsco/emino l'evento da chiamare quando la props viene modificata
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
