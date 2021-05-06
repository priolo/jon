//import { MultiStoreProvider, rvxStoreSetup } from './lib/store/rvx'
import { 
    setupStore, MultiStoreProvider, getStore, useStore,
    getAllStates, setAllState, getAllStores
} from './lib/store/rvxProviders'
import mixStores from './lib/store/mixStores'

import { useValidator, validateAll, resetAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

import * as ref from "./lib/object/ref"
import * as recorder from "./lib/store/recorder"
import * as player from "./lib/store/player"

// store
export {
  setupStore,
  MultiStoreProvider,
  getStore, 
  useStore,
  mixStores,

  getAllStates,
  setAllState,
  getAllStores,
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

  ref,
}
