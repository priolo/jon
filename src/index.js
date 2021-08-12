
import { 
	setupStore, MultiStoreProvider, getStore, useStore,
	StoreProvider, useDynamicStore, getDynamicStore,
} from './lib/store/rvxProviders'
import { getAllStates, setAllState } from './lib/store/rvxUtils'

import mixStores from './lib/store/mixStores'

import { useValidator, validateAll, resetAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

import recorder, {RECORDER_ACTIONS, RECORDER_STATE} from "./lib/store/recorder"
import player from "./lib/test/player"



// store
export {
	setupStore,
	MultiStoreProvider,
	getStore,
	useStore,
	mixStores,

	StoreProvider,
	useDynamicStore,
	getDynamicStore,

	getAllStates,
	setAllState,
}

// recrder, player
export {
	recorder, RECORDER_ACTIONS, RECORDER_STATE,
	player
}

// validate, ref
export {
	useValidator,
	validateAll,
	resetAll,
	rules,
}
