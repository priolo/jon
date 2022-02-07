
import { MultiStoreProvider, getStore, useStore } from './lib/store/rvxProviders'
import { getAllStates, setAllState, options, ENVIROMENTS } from './lib/store/rvxUtils'
import mixStores from './lib/store/mixStores'

import { useValidator, validateAll, resetAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

import recorder, { RECORDER_ACTIONS, RECORDER_STATE } from "./lib/test/recorder"
import player from "./lib/test/player"



// store
export {
	MultiStoreProvider,
	getStore,
	useStore,
	mixStores,

	getAllStates,
	setAllState,
	options,
	ENVIROMENTS,
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
