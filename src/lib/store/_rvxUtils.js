import utils from "@priolo/jon-utils"
import { getAllStores } from "./rvxProviders"

/**
 * @typedef {import("../test/recorder").RecOption} RecOption
 */

/**
 * Returns the status of all STORES
 * @param {RecOption} options  
 * @example
 * // in this case, ONLY Store1 and Store2 will be included and only the properties indicated
 * { include: ["Store1.value.prop", "Store2.value"] }
 * // ALL STATES of ALL STORES EXCEPT for
 * // "Store2" and the "id" property of the "user" object of "Store3"
 * { exclude: ["Store2", "Store3.user.id"]}
 * @returns {JSON} copy of the * STATE * of all * STORE *
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
 * I set the STATE to all the STORES
 * @param {Object.<string,Object>} states   
 * a DICTIONARY with KEY the name of the store and as VALUE the value of the STATE
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
 * transforms a series of paths into a DICTIONARY useful for when I have to get the STATE
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