import { addWatch, EVENTS_TYPES, pluginEmit, removeWatch } from "./rvxPlugin";

//#region TYPEDEF

/**
 * @typedef {import("./rvxPlugin").Listener} Listener
 */

/**
 * @typedef {(state:Object, props:Object, store:Store)=>Object} CallStoreSetup
 * @typedef {(props:Object)=>Object} CallStore
 * @typedef {Object.<string,Object.<string,(store:Store,value:*)=>void>>} Watch
 */

/**
 * @typedef {Object} StoreSetup 
 * @property  {Object} state
 * @property  {Object.<string,CallStoreSetup>} getters
 * @property  {Object.<string,CallStoreSetup>} actions
 * @property  {Object.<string,CallStoreSetup>} actionsSync
 * @property  {Object.<string,CallStoreSetup>} mutators
 * @property  {Watch} watch
 */

/**
 * @typedef {Object} Store
 * @property {string} _name
 * @property {Object} state
 * @property {Listener[]} _watch
 * @property {...Object.<string, CallStore>}
 */

//#endregion



/**@type {boolean} Indica se l'ultimo blocco di codice è stato chiamato internamente allo store oppure no */
let _block_subcall = false

/**
 * create a STORE with a SETUP-STORE
 * @param {StoreSetup} setup 
 * @returns {Store}
 */
export function createStore(setup, name) {

	/**@type {Store} */
	let store = {

		/**
		 * Il nome di registrazione dello STORE in JON
		 */
		_name: name,

		/**
		 * useState di React che contengono lo state "reattivo"
		 * è un array perce' potrebbe essere spalmato su piu' Components 
		 */
		_reducers: [],

		/**
		 * get STATE of the STORE
		 * @returns {Object}
		 */
		get state() {
			return store._reducers[0]?.[0]
		},

		// "reducers" to make a change to the STATE
		_dispatchState: (state) => {
			return store._reducers.forEach(reducer => {
				reducer[1](state)
			})
		},

		/**
		 * Chiamato dai MUTATOR per effettare una modifica allo STATE
		 * @param {(state:Object)=>Object} fn reducer (oldState) => newState 
		 */
		_dispatchReducer: (fn) => {
			store._reducers.forEach(reducer => {
				reducer[1](fn)
			})
		},

		/**
		 * called to replace and update the STATE
		 * @param {Object} payload se è null aggiorna lo STORE con lo stesso STATE di prima
		 * @returns {Object}
		 */
		_update: payload => {
			const state = payload ?? { ...store.state }
			return store._dispatchState(state)
		},

		// allows you to call an "action" in order to be synchronized with the "mutations"
		_syncAct: async (action, payload) => {
			// TO DO: dovrebbe attendere tutti i reducers e non solo il primo
			return new Promise((res, rej) => {
				store._reducers.forEach(red => {
					red[1](async (state) => {
						const ret = await action(payload, state)
						res(ret)
						return state
					})
				})
			})
		},

		/**
		 * [TODO] MEMO
		 * restituiscono il valore memorizzato se il payload non è cambiato dal precedente esecuzione
		 * altrimenti eseguono la funzione e memorizza il risultato
		 */
		_memo: async (action, payload) => {
		},

		/**
		 * chiamato su inizializzazione dello store
		 * prima che TUTTI gli store siano inizializzati
		 */
		_init: () => {
			if (setup.init) setup.init(store)
		},

		/**
		 * chiamato su inizializzazione dello store
		 * quando tutti gli store sono stati inizializzati
		 */
		_initAfter: () => {
			if (setup.initAfter) setup.initAfter(store)
		},

		/**
		 * chiamato quando lo STORE è stato rimosso
		 */
		_remove: () => {
			for (const listener of store._watch) {
				removeWatch(listener)
			}
		},

		_watch: [],
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

				pluginEmit(EVENTS_TYPES.ACTION, store._name, key, payload, result, tmp)
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

				pluginEmit(EVENTS_TYPES.ACTION_SYNC, store._name, key, payload, result, tmp)
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
					pluginEmit(EVENTS_TYPES.MUTATION, store._name, key, payload, null, _block_subcall)
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
		for (const storeName in setup.watch) {
			const storeWatch = setup.watch[storeName]

			for (const actionName in storeWatch) {
				const callbackStore = storeWatch[actionName]

				const callbackPlugin = (msg) => {
					callbackStore(store, msg.payload)
				}
				const listener = { storeName, actionName, callback: callbackPlugin }
				addWatch(listener)
				store._watch.push(listener)
			}
		}
	}

	/**
	 * MEMO
	 * restituiscono il valore memorizzato se il payload non è cambiato dal precedente esecuzione
	 * altrimenti eseguono la funzione e memorizza il risultato
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

