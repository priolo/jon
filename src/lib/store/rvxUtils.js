import utils from "@priolo/jon-utils"
import { getAllStores } from "./rvxProviders"

/**
 * @typedef {import("../test/recorder").RecOption} RecOption
 */

/**
 * Restituisce lo stato di tutti gli STORES
 * @param {RecOption} options  
 * @example
 * // in questo caso saranno inclusi SOLO Store1 e Store2 e solo le proprietà indicate
 * { include: ["Store1.value.prop", "Store2.value"] }
 * // TUTTI gli STATE di TUTTI gli STORE ECCETTO per 
 * // "Store2" e la proprietà "id" dell'oggetto "user" dello "Store3"
 * { exclude: ["Store2", "Store3.user.id"]}
 * @returns {JSON} copia degli *STATE* di tutti gli *STORE*
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
 * @param {Object.<string,Object>} states   
 * un DICTIONARY con KEY il nome dello store e come VALUE il valore dello STATE  
 * @example  
 * `{ "storename1": { value: 4 }, "storename2": { value: 13 } }`
 * @returns {void}
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
 * @returns {Object.<string,string[]>} 
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