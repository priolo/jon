import utils from "@priolo/jon-utils"
import { getAllStores } from "./rvxProviders"




function getAllExclusion(exclude) {
	if ( !exclude ) return {}
	return exclude.reduce((acc, opt) => {
		const pIndex = opt.indexOf(".")
		const storeName = opt.slice(0, pIndex == -1 ? opt.length : pIndex)
		if (!acc[storeName]) acc[storeName] = []
		if (pIndex != -1) acc[storeName].push(opt.slice(pIndex+1))
		return acc
	}, {})
}




export function getAllStates(opt) {
	const excStores = getAllExclusion(opt?.exclude)
	const stores = getAllStores()
	const states =  Object.keys(stores).reduce((states, key) => {
		const excProps = excStores[key]
		if (excProps && excProps.length == 0) return states

		const state = utils.cloneDeep(stores[key].state)

		if (excProps && excProps.length > 0) utils.exploreMap(state, excProps, act => delete act.parent[act.key])

		states[key] = state
		return states
	}, {})
debugger
	return states
}

export function setAllState(states) {
	const stores = getAllStores()
	
	return Object.keys(stores).forEach(key => {
		stores[key]._update(states[key])
	}, {})
}

