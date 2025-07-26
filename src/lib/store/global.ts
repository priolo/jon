import { EVENTS_TYPES } from "./rvxPlugin.js"


/** Indica di che tipo è l'evento "onListenerChange" */
export enum LISTENER_CHANGE {
	ADD = 0,
	REMOVE,
}

/**
 * Lets you create a STORE with 'createStore'
 */
export interface StoreSetup<T=any> {
	/** quando cambiano i LISTERNES */
	onListenerChange?: (store: any, type: LISTENER_CHANGE) => void
	/** quanto lo stato dello STORE cambia */
	onStateChange?: (store: StoreCore<T>, oldState: any) => void
	state?: T | (() => T),
	getters?: { [name: string]: CallStoreSetup<T> },
	actions?: { [name: string]: CallStoreSetup<T> },
	actionsSync?: { [name: string]: CallStoreSetup<T> },
	mutators?: { [name: string]: CallStoreSetup<T> },
}

/**
 * The functions of `StoreSetup` ALL have this signature
 * @param payload parameter passed to STORE
 * @param store the STORE object itself... can be seen as a kind of `this`
 */
type CallStoreSetup<T> = (payload: any | null, store?: StoreCore<T>) => any



/**
 * Instance of a STORE 
 */
export interface StoreCore<T=any> {
	state: T,
	_listeners: Set<ReducerCallback<any>>,
	_subscribe: (onStoreChange: ReducerCallback<any>, fn?: FnConditionalRendering<any>) => (() => void),
	_update: () => void
	/** chiamato quando i listener cambiano */
	_listenerChange?: (store: any, type: LISTENER_CHANGE) => void
	_stateChange?: (store: any, oldState: any) => void
}

export type FnConditionalRendering<T> = (state: T, oldState: T) => boolean

export type ReducerCallback<T> = {
	(state: any): void;
	fn?: FnConditionalRendering<T>;
}



/**
 * Instance of a STORE with the functions that have been defined in StoreSetup
 */
export type Store = StoreCore<any> //| { [key: string]: any }
/**
 * all STORE methods have this signature
 */
type CallStore = (payload: any | null) => any | void



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
