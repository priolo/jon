import { useContext } from "react";

/**
 * simply put REDUCER (and BUNDLE) in a STORE and returns the instance. This is to optimize.
 * So we always use the same STORE instance but with a different REDUCER
 * Use this instance synchronously!
 */
export function getApplyStore(store, reducer) {
	store._reducer = reducer;
	if (store._init) {
		store._init()
		store._init = null
	}
	return store
}

/**
 * Apply context REDUCEER to a STORE
 * and returns it
 * @param {*} store 
 * @param {*} context 
 * @param {*} bundle 
 */
export function useApplyStore(store, context) {
	const reducer = useContext(context)
	store._reducer = reducer
	if (store._init) {
		store._init()
		store._init = null
	}
	return store
}

/**
 * create a STORE with a SETUP-STORE
 * @param {JSON} setup 
 */
export function createStore(setup) {

	// default
	let store = {
		_reducer: null,
		get state() {
			return store._reducer[0]
		},
		get d() {
			return store._reducer[1]
		},
	}

	// permette di aggiornare lo "state"
	store._update = payload => store.d(state => ({ ...state }))

	// initialization
	store._init = () => {
		if (setup.init) setup.init(store)
	}

	/**
	 * GETTERS
	 */
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = payload => setup.getters[key](store.state, payload, store/*, store._bundle*/)
			return acc
		}, store)
	}

	/**
	 * ACTIONS
	 */
	if (setup.actions) {
		store = Object.keys(setup.actions).reduce((acc, key) => {
			acc[key] = async payload => {
				const result = await setup.actions[key](store.state, payload, store/*, store._bundle*/)
				return result
			}
			return acc
		}, store)
	}

	/**
	 * ACTION SYNC
	 */
	if (setup.actionsSync) {
		store = Object.keys(setup.actionsSync).reduce((acc, key) => {
			acc[key] = payload => {
				const result = setup.actionsSync[key](store.state, payload, store/*, store._bundle*/)
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
			acc[key] = payload => store.d(state => {
				const stub = setup.mutators[key](state, payload, store/*, store._bundle*/)
				if (stub == null) return state
				// per ottimizzare controllo se c'e' qualche cambiamento
				if (Object.keys(stub).some(key => stub[key] != state[key])) return { ...state, ...stub }
				return state
			})
			return acc
		}, store)
	}

	/**
	 * MEMO
	 * restituiscono il valore memorizzato se lo store e il payload sono gli stessi
	 * altrimenti eseguono la funzione
	 */
	// if (setup.memo) {
	// 	store = Object.keys(setup.memo).reduce((acc, key) => {
	// 		acc[key] = payload => store.d(state => {
	// 			const stub = setup.mutators[key](state, payload, store, store._bundle);
	// 			if ( stub == null ) return state;
	// 			return { ...state, ...stub };
	// 		});
	// 		return acc;
	// 	}, store)
	// }

	return store
}