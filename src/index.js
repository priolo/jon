
import { setupStore, MultiStoreProvider, getStore, useStore } from './lib/store/rvxProviders'
import { getAllStates, setAllState } from './lib/store/rvxUtils'

import mixStores from './lib/store/mixStores'

import { useValidator, validateAll, resetAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

import recorder from "./lib/store/recorder"
import player from "./lib/store/player"



// store
export {
	setupStore,
	MultiStoreProvider,
	getStore,
	useStore,
	mixStores,

	getAllStates,
	setAllState,
}

// recrder, player
export {
	recorder,
	player
}

// validate, ref
export {
	useValidator,
	validateAll,
	resetAll,
	rules,
}
