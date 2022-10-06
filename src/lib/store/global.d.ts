import { EVENTS_TYPES } from "./rvxPlugin"


/**
 * Lets you create a STORE with 'createStore'
 */
 interface StoreSetup {
	state: any,
	getters: { [name: string]: CallStoreSetup },
	actions: { [name: string]: CallStoreSetup },
	actionsSync: { [name: string]: CallStoreSetup },
	mutators: { [name: string]: CallStoreSetup },
}

/**
 * The functions of `StoreSetup` ALL have this signature
 * @param payload parameter passed to STORE
 * @param store the STORE object itself... can be seen as a kind of `this`
 */
type CallStoreSetup = (payload: any|null, store: Store) => Object



/**
 * Instance of a STORE 
 */
interface StoreCore {
	state: any,
	_listeners: Set<WatchCallback>,
	_subscribe: (onStoreChange: WatchCallback) => (() => void),
	_update: () => void
}
/**
 * Instance of a STORE with the functions that have been defined in StoreSetup
 */
export type Store = StoreCore// & { [key: string]: CallStore }
/**
 * all STORE methods have this signature
 */
type CallStore = (payload: any|null) => any | void



/**
 * Identifies a `callback` called when a specific STORE `action/mutator` is executed
 */
export interface Watcher {
	/** STORE instance to be observed */
	store: Store,
	/** name of the 'action' or 'mutator' to be observed */
	actionName: string,
	/** Function executed when 'action' or 'mutator' are called */
	callback: WatchCallback,
}

/**
 * Data of an event that occurred in a STORE. 
 * @param msg contiene i dati dell'evento 
 */
export type WatchCallback = (msg: WatchMsg) => void

/**
 * Data of an event that occurred in a STORE. 
 */
 export interface WatchMsg {
	/** type of event, may be: `mutator`, `action` */
	type: EVENTS_TYPES,
	/** STORE instance that generated this event */
	store: Store,
	/** Name of the 'action' or 'mutator' that generated this event */
	key: string,
	/** Parameters sent to the 'action' or 'mutator' */
	payload: any,
	/** Value returned by 'action' */
	result: any,
	/** true if it is a call from another 'action' */
	subcall: boolean
}
