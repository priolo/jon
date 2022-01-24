import { getStore } from "./rvxProviders"

/** 
 * @typedef {Object} Listener
 * @property {string} listener nome dello STORE che vuole le notifiche
 * @property {string} source nome dello STORE che emette le notifiche
 */

/**
 * Tipi di eventi generati da un WATCH di uno STORE
 */
export const STORE_EVENTS = {
	ACTION: "action",
	ACTION_SYNC: "action-sync",
	MUTATION: "mutation",
}

/**
 * Sono i listener che devono ricevere le notifiche
 * @type {Listener[]}
 */
let watchLinks = []

/**
 * Inserisco in JON gli eventuali "watch" di uno STORE
 * @param {string} listener nome dello STORE
 * @returns {void}
 */
export function addWatch(listener) {
	const storeListener = getStore(listener)
	if (!storeListener) return
	if (storeListener._watch) {
		for (const source in storeListener._watch) {
			watchLinks.push({ listener, source })
		}
	}
	watchLinksUpdate()
}

/**
 * Rimuove da JON eventuali "watch" di uno STORE
 * @param {string} listener nome dello STORE
 * @returns {void}
 */
export function removeWatch(listener) {
	const storeListener = getStore(listener)
	if (!storeListener) return
	// tolgo dai temporanei
	watchLinks = watchLinks.filter(l => l.source != listener && l.listener != listener)
	// elimino gli eventi se ci sono
	if (!storeListener._watch) return
	for (const source in storeListener._watch) {
		const storeSource = getStore(source)
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

	const storeListener = getStore(listener)
	if (!storeListener || !storeListener._watch) return false
	const callbacks = storeListener._watch[source]
	if (!callbacks) return null

	const storeSource = getStore(source)
	if (!storeSource) return false
	const emitter = storeSource.emitter

	for (const propName in callbacks) {
		const callback = callbacks[propName]
		emitter.on(STORE_EVENTS.MUTATION, callback)
	}
	return true
}

