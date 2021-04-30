import { useContext } from "react";


export const EVENT_TYPE = {
	ACTION: 1,
	ACTION_SYNC: 2,
	MUTATION: 3,
}


/**
 * simply put REDUCER (and BUNDLE) in a STORE and returns the instance. This is to optimize.
 * So we always use the same STORE instance but with a different REDUCER
 * Use this instance synchronously!
 */
export function getApplyStore(store, reducer) {
	store._reducer = reducer
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

		// permette di aggiornare lo "state"
		_update: payload => {
			store.d(state => {
				if ( payload==null ) payload = {...state}
				return payload
			})
		},

		// initialization
		_init: () => {
			if (setup.init) setup.init(store)
		},




		_listeners: [],

		subscribe: (callback) => {
			store.unsubscribe(callback)
			store._listeners.push(callback)
		},

		unsubscribe: (callback) => {
			const index = store._listeners.findIndex(listener => listener == callback)
			if (index != -1) store._listeners.splice(index, 1)
		},

		notify: (type, key, payload, result) => {
			store._listeners.forEach ( listener => listener(type, key, payload, result) )
		}
	}

	/**
	 * GETTERS
	 */
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = payload => setup.getters[key](store.state, payload, store)
			return acc
		}, store)
	}

	/**
	 * ACTIONS
	 */
	if (setup.actions) {
		store = Object.keys(setup.actions).reduce((acc, key) => {
			acc[key] = async payload => {
				const result = await setup.actions[key](store.state, payload, store)
				store.notify(EVENT_TYPE.ACTION, key, payload, result)
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
				const result = setup.actionsSync[key](store.state, payload, store)
				store.notify(EVENT_TYPE.ACTION_SYNC, key, payload, result)
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
				const stub = setup.mutators[key](state, payload, store)
				if (stub == null) return state

				// per ottimizzare controllo se c'e' qualche cambiamento
				if (Object.keys(stub).some(key => stub[key] != state[key])) state = { ...state, ...stub }

				store.notify(EVENT_TYPE.MUTATION, key, payload)

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