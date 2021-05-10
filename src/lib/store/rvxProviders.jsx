import React, { useEffect, useReducer } from 'react';
import { getApplyStore, createStore, useApplyStore } from './rvx';
import { exploreMap } from '@priolo/jon-utils';



// All the SETUP used to create the STORE
let setups
/* All the CONTEXT created in "setupStore"
contain the REDUCER of a STORE
are taken from the REACT components through a PROVIDER */
let contexts
// All the STORES created in "setupStore"
let stores
// all REDUCERS, are inside the CONTEXT, are created in "MultiStoreProvider"
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

}

/**
 * Returns a STORE by its name
 * It is useful for using a STORE outside a REACT COMPONENT
 * @param {string} storeName 
 * @param {any} bundle 
 */
export function getStore(storeName) {
	return getApplyStore(stores[storeName], reducers[storeName])
}

/**
 * Use a STORE by its name
 * It is useful for using a STORE in a REACT COMPONENT
 * @param {*} storeName 
 * @param {*} bundle 
 */
export function useStore(storeName) {
	return useApplyStore(stores[storeName], contexts[storeName])
}







function getAllExclusion(exclude) {
	return exclude.reduce((acc, opt) => {
		const pIndex = opt.indexOf(".")
		const storeName = opt.slice(0, pIndex == -1 ? opt.length : pIndex)
		if (!acc[storeName]) acc[storeName] = []
		if (pIndex != -1) acc[storeName].push(opt.slice(pIndex+1))
		return acc
	}, {})
}




export function getAllStates(opt) {
	const excStores = getAllExclusion(opt.exclude)
	debugger
	return Object.keys(stores).reduce((states, key) => {

		const excProps = excStores[key]
		if (excProps && excProps.length == 0) return states

		const state = stores[key].state

		if (excProps && excProps.length > 0) exploreMap(state, excProps, act => delete act.parent[act.key])

		states[key] = state
		return states
	}, {})
}

export function setAllState(states) {
	return Object.keys(stores).forEach(key => {
		stores[key]._update(states[key])
	}, {})
}

export function getAllStores(opt) {
	return stores
}



















/**
 * REACT PROVIDER that contains all REDUCERS
 * @param {*} param0 
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
		// [II] inserire qua un init dello store con il suo reducer!
		stores[provider]._reducer = reducers[provider]
		stores[provider]._init()
	}, [])

	return React.createElement(context.Provider, {
		value: redux
	}, prvs_c.length > 0 ? React.createElement(MultiStoreProvider, {
		providers: prvs_c,
		children: children
	}) : children);
}