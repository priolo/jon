import utils from "@priolo/jon-utils"
import { getAllStores } from "./rvxProviders"



/**
 * restituisce lo stato di tutti gli STORES
 * @param {object} options  
 * **include**: string[] verranno presi SOLO i dati relativi a queste path  
 * **exclude**: string[] i dati relativi a queste path sono eliminati
 * @returns 
 * JSON copia dei valori presenti in *STATE* di tutti gli *STORE*
 */
export function getAllStates(options) {
	const excludes = getStructureStoreFromPaths(options?.exclude)
	const includes = getStructureStoreFromPaths(options?.include)
	const stores = getAllStores()
	const states = Object.keys(stores).reduce((states, key) => {
		const includeStore = includes[key]
		const excludeStore = excludes[key]
		if (excludeStore && excludeStore.length == 0) return states
		if (!includeStore && Object.keys(includes).length > 0 ) return states 

		let state = utils.cloneDeep(stores[key].state)

		if (excludeStore && excludeStore.length > 0) utils.exploreMap(state, excludeStore).forEach( prop => delete prop.parent[prop.key] )
		if (includeStore && includeStore.length > 0) state = utils.includeMap(state, includeStore)

		states[key] = state
		return states
	}, {})
	return states
}

/**
 * Setto lo STATE a tutti gli STORE
 * @param {*} states   
 * un DICTIONARY con KEY il nome dello store e come VALUE il valore dello STATE  
 * e.s.:  
 * `{ "storename1": { value: 4 }, "storename2": { value: 13 } }`
 */
export function setAllState(states) {
	const stores = getAllStores()

	return Object.keys(stores).forEach(key => {
		stores[key]._update(states[key])
	}, {})
}

/**
 * trasforma una serie di path in un DICTIONARY utile per quando devo prelevare lo STATE
 * @param {string[]} struct 
 * @returns {object} 
 */
export function getStructureStoreFromPaths(struct) {
	if (!struct) return {}
	return struct.reduce((acc, opt) => {
		if (!opt) return acc
		const pIndex = opt.indexOf(".")
		const storeName = opt.slice(0, pIndex == -1 ? opt.length : pIndex)
		if (!acc[storeName]) acc[storeName] = []
		if (pIndex != -1) acc[storeName].push(opt.slice(pIndex + 1))
		return acc
	}, {})
}


// export const ENVIROMENTS = {
// 	UNKNOW: 0,
// 	NEXT: 1,
// }

export const options = {
//	env: ENVIROMENTS.UNKNOW,
	disableCheckNext : false,
}