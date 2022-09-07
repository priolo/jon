

interface StoreCore {
	state: any,
	_listeners: Set<WatchCallback>,
	_subscribe: (onStoreChange: WatchCallback) => (() => void),
	_update: () => void
}

export type WatchCallback = (state:any) => void
type CallStoreSetup = (props: Object, store: Store) => Object
type CallStore = (props: Object) => Object | void
export type Store = StoreCore & { [key: string]: CallStore | any }

interface StoreSetup {
	state: any,
	getters: { [name: string]: CallStoreSetup },
	actions: { [name: string]: CallStoreSetup },
	actionsSync: { [name: string]: CallStoreSetup },
	mutators: { [name: string]: CallStoreSetup },
}

