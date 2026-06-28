import { EVENTS_TYPES } from "./rvxPlugin.js"



/** Indicates the type of the "onListenerChange" event */
export enum LISTENER_CHANGE {
	ADD = 0,
	REMOVE,
}

/**
 * Lets you create a STORE with 'createStore'
 */
export interface StoreSetup<T=any> {
	/** called when the LISTENERS change */
	onListenerChange?: (store: Store<T>, type: LISTENER_CHANGE) => void
	/** called when the STORE state changes */
	onStateChange?: (store: StoreCore<T>, oldState: T) => void
	state?: T | (() => T),
	getters?: { [name: string]: CallStoreSetup<T> },
	actions?: { [name: string]: CallStoreSetup<T> },
	//actionsSync?: { [name: string]: CallStoreSetup<T> },
	mutators?: { [name: string]: CallStoreSetup<T> },
}

/**
 * The functions of `StoreSetup` ALL have this signature
 * @param payload parameter passed to STORE
 * @param store the STORE object itself... can be seen as a kind of `this`.
 * It is the permissive `Store` handle (index signature included) so a setup
 * function can call sibling methods (`store.setX(...)`) without a circular type.
 */
type CallStoreSetup<T> = (payload: any, store: Store<T>) => any



/**
 * Instance of a STORE
 */
export interface StoreCore<T=any> {
	/**
	 * the current state of the store. It is updated by mutators
	 */
	state: T,
	/**
	 * the listeners that are watching the store
	 */
	_listeners: Set<ReducerCallback<any>>,
	/**
	 * add listener to the store. Called by "useSyncExternalStore"
	 */
	_subscribe: (onStoreChange: ReducerCallback<any>, fn?: FnConditionalRendering<T>) => (() => void),
	_update: (oldState?: T, onlyNotify?: boolean) => void
	/** called when the listeners change */
	_listenerChange?: (store: any, type: LISTENER_CHANGE) => void
	_stateChange?: (store: any, oldState: any) => void
}

export type FnConditionalRendering<T> = (state: T, oldState: T) => boolean

export type ReducerCallback<T> = {
	(state: any): void;
	fn?: FnConditionalRendering<T>;
}

/**
 * Permissive STORE handle: the reactive core plus an index signature, so the
 * dynamically-attached methods (`store.setX(...)`) are callable without a
 * circular type. Used *inside* setup functions and wherever the precise method
 * shape is not known; calls through the index signature are not type-checked.
 */
export type Store<T = any> = StoreCore<T> & Record<string, any>




// --- type inference: derive the public STORE shape from its SETUP ------------
//
// The trick (see also `rvx_juice.ts`): `createStore` is generic over the literal
// SETUP type `S`, so every getter/action/mutator keeps its real signature. From
// `S` we rebuild the methods exactly as they are exposed on the store: the
// injected `store` argument is stripped, leaving `name(payload) => result`.

/** 
 * the resolved state type (unwraps a `() => state` factory) 
 * S is the STORE SETUP type
 * */
type StateOf<S> = S extends { state: infer St }
	? (St extends () => infer R ? R : St)
	: Record<string, never>

/** true only for `any`; lets us treat an un-annotated payload as optional */
type IsAny<T> = 0 extends (1 & T) ? true : false

/**
 * Strip the injected `store` param, keeping the public `(payload) => result`:
 * - un-annotated payload (`any`) ........ `(payload?: any) => R`  (e.g. `(_, store) => …`)
 * - no payload (`void`/`unknown`/none) .. `() => R`
 * - annotated payload `P` ............... `(payload: P) => R`     (kept required)
 */
type PublicFn<F> = F extends (payload: infer P, ...rest: any[]) => infer R
	? (IsAny<P> extends true ? (payload?: any) => R
		: [P] extends [void] ? () => R
		: [unknown] extends [P] ? () => R
		: (payload: P) => R)
	: never

/** like `PublicFn`, but mutators always resolve to `void` at runtime */
type PublicMut<F> = F extends (payload: infer P, ...rest: any[]) => any
	? (IsAny<P> extends true ? (payload?: any) => void
		: [P] extends [void] ? () => void
		: [unknown] extends [P] ? () => void
		: (payload: P) => void)
	: never

/** the callable methods exposed on the store, rebuilt from the setup */
type Methods<S> =
	& (S extends { getters: infer G } ? { [K in keyof G]: PublicFn<G[K]> } : {})
	& (S extends { actions: infer A } ? { [K in keyof A]: PublicFn<A[K]> } : {})
	& (S extends { mutators: infer M } ? { [K in keyof M]: PublicMut<M[K]> } : {})

/**
 * The fully-typed STORE returned by `createStore`: the reactive core typed over
 * the inferred state, plus the inferred getters/actions/mutators as methods.
 * No cast or hand-written interface required at the call site.
 */
export type StoreOf<S> = StoreCore<StateOf<S>> & Methods<S>

// -----------------------------------------------------------------------------



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
 * Callback invoked when a watched STORE event occurs.
 * @param msg holds the event data
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
