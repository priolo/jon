import { EVENTS_TYPES } from "./rvxPlugin.js"



/** Indicates the type of the "onListenerChange" event */
export enum LISTENER_CHANGE {
	ADD = 0,
	REMOVE,
}

type StoreSetupMethods<T> = Record<string, CallStoreSetup<T>>

/** Lets you create a STORE with 'createStore'. */
export interface StoreSetup<T=any> {
	/** called when the LISTENERS change */
	onListenerChange?: (store: Store<T>, type: LISTENER_CHANGE) => void
	/** called when the STORE state changes */
	onStateChange?: (store: StoreCore<T>, oldState: T) => void
	state?: T | (() => T),
	getters?: StoreSetupMethods<T>,
	actions?: StoreSetupMethods<T>,
	mutators?: StoreSetupMethods<T>,
}

/**
 * The functions of `StoreSetup` ALL have this signature
 * @param payload parameter passed to STORE
 * @param store the STORE object itself... can be seen as a kind of `this`.
 * Typed as `any` on purpose: a setup function may annotate it with its own
 * precise store (`store?: MyStore`, where `interface MyStore extends StoreOf<typeof setup> {}`).
 * A `Store<T>` here would reject that annotation (parameters are contravariant).
 */
type CallStoreSetup<T> = (payload: any, store?: any) => any




/**
 * Instance of a STORE CORE
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
type StateOf<S> = S extends { state?: infer St }
	? (St extends () => infer R ? R : St)
	: Record<string, never>

/** true only for `any`; lets us treat an un-annotated payload as optional */
type IsAny<T> = 0 extends (1 & T) ? true : false

/**
 * true only for `unknown`.
 * `[unknown] extends [P]` alone is not enough: TS reports it as true also for
 * "weak" types (all-optional properties, e.g. `Partial<Entity>`), so a typed
 * payload would be dropped. `keyof unknown` is `never`, a weak type has keys.
 */
type IsUnknown<T> = IsAny<T> extends true ? false
	: unknown extends T ? ([keyof T] extends [never] ? true : false)
	: false

/** Extracts the first public payload parameter without requiring a second argument. */
type PayloadOf<F> = F extends (...args: infer A) => any
	? A extends [infer P, ...any[]] ? P : void
	: never

/**
 * Strip the injected `store` param, keeping the public `(payload) => result`:
 * - un-annotated payload (`any`) ........ `(payload?: any) => R`  (e.g. `(_, store) => …`)
 * - no payload (`void`/`unknown`/none) .. `() => R`
 * - annotated payload `P` ............... `(payload: P) => R`     (kept required)
 */
type PublicCall<P, R> = IsAny<P> extends true ? (payload?: any) => R
	: [P] extends [void] ? () => R
	: IsUnknown<P> extends true ? () => R
	: (payload: P) => R

type PublicFn<F> = F extends (...args: any[]) => infer R
	? PublicCall<PayloadOf<F>, R>
	: never

/** like `PublicFn`, but mutators always resolve to `void` at runtime */
type PublicMut<F> = F extends (...args: any[]) => any
	? PublicCall<PayloadOf<F>, void>
	: never

/** the callable methods exposed on the store, rebuilt from the setup */
type Methods<S> =
	& (S extends { getters?: infer G } ? { [K in keyof G]: PublicFn<G[K]> } : {})
	& (S extends { actions?: infer A } ? { [K in keyof A]: PublicFn<A[K]> } : {})
	& (S extends { mutators?: infer M } ? { [K in keyof M]: PublicMut<M[K]> } : {})

/**
 * The fully-typed STORE returned by `createStore`: the reactive core typed over
 * the inferred state, plus the inferred getters/actions/mutators as methods.
 * No cast or hand-written interface required at the call site.
 */
export type StoreOf<S extends StoreSetup> = StoreCore<StateOf<S>> & Methods<S>

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
}
