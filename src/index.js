//import { MultiStoreProvider, rvxStoreSetup } from './lib/store/rvx'
import { setupStore, MultiStoreProvider, getStore, useStore } from './lib/store/rvxProviders'
import mixStores from './lib/store/mixStores'

import { useValidator, validateAll, resetAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

import * as ref from "./lib/object/ref"
import * as recorder from "./lib/store/recorder"
import * as player from "./lib/store/player"


export {
  setupStore,
  MultiStoreProvider,
  getStore, 
  useStore,
  mixStores,
}

export {
  recorder,
  player
}


export {
	useValidator,
	validateAll,
  resetAll,
	rules,
  ref,
}
