
import { createStore, useStore } from './lib/store/rvx'
import mixStores from './lib/store/mixStores'
import { useValidator, validateAll, resetAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

// import { options, ENVIROMENTS } from './lib/store/rvxUtils'
// import recorder, { RECORDER_ACTIONS, RECORDER_STATE } from "./lib/test/recorder"
// import player from "./lib/test/player"


// store
export {
	createStore,
	useStore,
	mixStores,

	useValidator,
	validateAll,
	resetAll,
	rules,

	// options,
	// ENVIROMENTS,
}

// recrder, player
// export {
// 	recorder, RECORDER_ACTIONS, RECORDER_STATE,
// 	player
// }

