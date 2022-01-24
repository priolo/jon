/**
 * @typedef {import("./rvx").Store} Store
 * @typedef {(type:EVENTS_TYPES, payload:Object, result:Object, subcall:boolean)=>void} WatchCallback
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
}

/**
 * @type {Object.<string, Object.<string, Set.<WatchCallback> > >}
 */
const listeners = {}


/**
 * 
 * @param {EVENTS_TYPES} type 
 * @param {string} storeName 
 * @param {string} key 
 * @param {Object} payload 
 * @param {Object} result 
 * @param {boolean} subcall 
 */
export function pluginEmit(type, storeName, key, payload, result, subcall) {
	const callbacks = listeners[storeName]?.[key]
	if (!callbacks) return
	for (const callback of callbacks) {
		callback(type, payload, result, subcall)
	}
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