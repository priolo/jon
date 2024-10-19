import { useEffect, useState, useSyncExternalStore, version } from 'react'

// HOOK to use the STORE 
function useStore18(store) {
	return useSyncExternalStore(store._subscribe, () => store.state)
}
function useStore17(store) {
	const [state, setState] = useState(store.state)
	useEffect(() => store._subscribe(setState), [store])
	return state
}
export const useStore = version.slice(0,2)=="17" ? useStore17 : useStore18

export function createStore(setup, name) {

	let store = {
		// the current state of the store
		state: setup.state,
		// the listeners that are watching the store
		_listeners: new Set(),
		// add listener to the store
		_subscribe: (listener) => {
			store._listeners.add(listener)
			return () => store._listeners.delete(listener)
		},
	}

	// GETTERS
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = (payload) => setup.getters[key](payload, store)
			return acc
		}, store)
	}

	// ACTIONS
	if (setup.actions) {
		store = Object.keys(setup.actions).reduce((acc, key) => {
			acc[key] = async (payload) => await setup.actions[key](payload, store)
			return acc
		}, store)
	}

	// MUTATORS
	if (setup.mutators) {
		store = Object.keys(setup.mutators).reduce((acc, key) => {
			acc[key] = payload => {
				const stub = setup.mutators[key](payload, store)
				// if the "mutator" returns "undefined" then I do nothing
				if (stub === undefined) return
				// to optimize check if there is any change
				if (Object.keys(stub).every(key => stub[key] === store.state[key])) return
				store.state = { ...store.state, ...stub }
				store._listeners.forEach(listener => listener(store.state))
			}
			return acc
		}, store)
	}

	return store
}