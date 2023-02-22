
import { createStore, useStore } from './lib/store/rvx'
import mixStores from './lib/store/mixStores'

import { addWatch, removeWatch, EVENTS_TYPES} from "./lib/store/rvxPlugin"

import { useValidator, validateAll, resetAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

export type { StoreCore, StoreSetup } from "./lib/store/global"


export {
	createStore,
	useStore,
	mixStores,

	addWatch,
	removeWatch,
	EVENTS_TYPES,

	useValidator,
	validateAll,
	resetAll,
	rules,
}

