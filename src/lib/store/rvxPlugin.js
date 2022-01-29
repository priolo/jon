/**
 * @typedef {import("./rvx").Store} Store
 * @typedef { {type:EVENTS_TYPES, storeName:string, key:string, payload:Object, result:Object, subcall:boolean} } WatchMessage
 * @typedef { (msg:WatchMessage)=>void } WatchCallback
 * @typedef { {storeName:string, actionName:string, callback:WatchCallback} } Listener
 */

/**
 * Tipi di eventi generati da un WATCH di uno STORE
 * @readonly
 * @enum {string}
 */
export const EVENTS_TYPES = {
	ACTION: "action",
	ACTION_SYNC: "action-sync",
	MUTATION: "mutation",
	STORE_ADD: "store-add",
	STORE_REMOVE: "store-remove",
}

/**
 * @type {Object.<string, Object.<string, Set.<WatchCallback> > >}
 */
const listeners = {}


/**
 * Consegna l'evento a tutti i listener registrati
 * @param {EVENTS_TYPES} type 
 * @param {string} storeName 
 * @param {string} key 
 * @param {Object} payload 
 * @param {Object} result 
 * @param {boolean} subcall 
 */
export function pluginEmit(type, storeName, key, payload, result, subcall) {

	const msg = { type, storeName, key, payload, result, subcall }

	const callbacksJON = listeners["*"]?.["*"]
	if ( callbacksJON ) {
		for (const callback of callbacksJON) callback(msg)
	}

	const callbacksStore = listeners[storeName]
	if ( !callbacksStore ) return

	const callbacksStoreJolly = callbacksStore["*"]
	if ( callbacksStoreJolly ) {
		for (const callback of callbacksStoreJolly) callback(msg)
	}

	const callbacks = listeners[storeName][key]
	if (!callbacks) return

	for (const callback of callbacks) callback(msg)
}


/**
 * Inserisce un listener in JON
 * @param {Listener} param0 
 */
export function addWatch({ storeName, actionName, callback }) {
	let storeActions = listeners[storeName]
	if (!storeActions) {
		storeActions = {}
		listeners[storeName] = storeActions
	}
	let action = storeActions[actionName]
	if (!action) {
		action = new Set()
		storeActions[actionName] = action
	}
	action.add(callback)
}

/**
 * rimuove un listener da JON
 * @param {Listener} param0 
 */
export function removeWatch({ storeName, actionName, callback }) {
	const action = listeners[storeName]?.[actionName]
	if (!action) return
	action.delete(callback)
}