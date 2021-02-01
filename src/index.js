//import { MultiStoreProvider, rvxStoreSetup } from './lib/store/rvx'
import { setupStore, MultiStoreProvider, getStore, useStore } from './lib/store/rvxProviders'
import mixStore from './lib/store/mixStores'

import { useValidator, validateAll } from './lib/input/validator'
import { rules } from './lib/input/rules'

export {
  setupStore,
  MultiStoreProvider,
  getStore, 
  useStore,
  mixStore,
}

export {
	useValidator,
	validateAll,
	rules,
}