import { EventEmitter } from "@priolo/jon-utils"
import { STORE_EVENTS } from "./rvxUtils";



let _block_subcall = false

/**
 * create a STORE with a SETUP-STORE
 * @param {JSON} setup 
 */
export function createStore(setup) {

	// default
	let store = {

		_reducers: [],

		// return STATE of the STORE
		get state() {
			return store._reducers[0]?.[0]
		},

		// "reducers" to make a change to the STATE
		_dispatchState: (state) => {
			return store._reducers.forEach(reducer => {
				reducer[1](state)
			})
		},
		_dispatchReducer: (fn) => {
			store._reducers.forEach(reducer => {
				reducer[1](fn)
			})
		},


		// allows you to update the "state"
		_update: payload => {
			const state = payload ?? { ...store.state }
			return store._dispatchState(state)
		},

		// allows you to call an "action" in order to be synchronized with the "mutations"
		_syncAct: async (action, payload) => {
			// TO DO: dovrebbe attendere tutti i reducers e non solo il primo
			return new Promise((res, rej) => {
				store._reducers.forEach(red => {
					red[1](state => {
						const ret = action(payload, state)
						res(ret)
						return state
					})
				})
			})
		},

		// initialization
		_init: () => {
			if (setup.init) setup.init(store)
		},

		// emitter to handle events
		emitter: new EventEmitter(Object.values(STORE_EVENTS))

	}

	/**
	 * GETTERS
	 */
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = (payload, newState) => {
				if (newState == undefined) newState = store.state
				return setup.getters[key](newState, payload, store)
			}
			return acc
		}, store)
	}

	/**
	 * ACTIONS
	 */
	if (setup.actions) {
		store = Object.keys(setup.actions).reduce((acc, key) => {
			acc[key] = async (payload, newState) => {
				const tmp = _block_subcall
				if (tmp == false) _block_subcall = true

				if (newState == undefined) newState = store.state
				const result = await setup.actions[key](newState, payload, store)

				store.emitter.emit(STORE_EVENTS.ACTION, { key, payload, result, subcall: tmp })
				if (tmp == false) _block_subcall = false
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
			acc[key] = (payload, newState) => {
				const tmp = _block_subcall
				if (tmp == false) _block_subcall = true

				if (newState == undefined) newState = store.state
				const result = setup.actionsSync[key](store.state, payload, store)

				store.emitter.emit(STORE_EVENTS.ACTION_SYNC, { key, payload, result, subcall: tmp })
				if (tmp == false) _block_subcall = false
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
			acc[key] = payload => store._dispatchReducer(state => {
				const stub = setup.mutators[key](state, payload, store)
				// if the "mutator" returns "null" then I do nothing
				if (stub == null) return state
				// to optimize check if there is any change
				if (Object.keys(stub).some(key => stub[key] != state[key])) {
					state = { ...state, ...stub }
					// TODO: Questo evento va portato su "_dispatchReducer" perche' deve essere eseguito solo una volta.
					// ora invece è eseguito per tutti i provider con lo stesso nome
					store.emitter.emit(STORE_EVENTS.MUTATION, { key, payload, subcall: _block_subcall })
				}
				return state
			})
			return acc
		}, store)
	}

	/**
	 * WATCH
	 */
	if (setup.watch) {
		store._watch = Object.keys(setup.watch).reduce((storesInWatch, storeName) => {
			const setupWatch = setup.watch[storeName]
			storesInWatch[storeName] = Object.keys(setupWatch).reduce((callbacks, propName) => {
				// I create callbacks to pass to events
				// for the "watch section" for each STORE for each "mutator"
				callbacks[propName] = (event) => {
					if (event.payload.key != propName) return
					setupWatch[propName](store, event.payload.payload)
				}
				return callbacks
			}, {})
			return storesInWatch
		}, {})
	}

	/**
	 * MEMO
	 * restituiscono il valore memorizzato se lo store e il payload sono gli stessi
	 * altrimenti eseguono la funzione
	 * TO DO
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

