import { useCallback, useSyncExternalStore } from 'react'

/** re-render predicate: return true to re-render */
type ShouldRender<T> = (state: T, oldState: T) => boolean
/** listener attached by `useStore`; carries its optional predicate */
type Listener<T> = { (state: T): void; fn?: ShouldRender<T> }

export enum LISTENER_CHANGE { ADD, REMOVE }

/** The bare reactive core, without the dynamically-attached methods. */
export interface StoreCore<T = any> {
	state: T
	_listeners: Set<Listener<T>>
	_subscribe: (listener: Listener<T>, fn?: ShouldRender<T>) => () => void
	_update: (oldState?: T, onlyNotify?: boolean) => void
	_listenerChange?: (store: StoreCore<T>, type: LISTENER_CHANGE) => void
	_stateChange?: (store: StoreCore<T>, oldState: T) => void
}

/**
 * Permissive store handle used *inside* setup functions: it exposes the core
 * plus an index signature, so a function can call sibling methods
 * (`store.setX(...)`) without a circular type. Calls are not type-checked.
 */
export type Store<T = any> = StoreCore<T> & Record<string, any>

export interface StoreSetup<T = any> {
	state?: T | (() => T)
	getters?: Record<string, (payload: any, store: Store<T>) => any>
	actions?: Record<string, (payload: any, store: Store<T>) => any>
	mutators?: Record<string, (payload: any, store: Store<T>) => Partial<T> | void>
	onListenerChange?: (store: Store<T>, type: LISTENER_CHANGE) => void
	onStateChange?: (store: Store<T>, oldState: T) => void
}

// --- type inference: derive the public store shape from the setup -----------

/** the resolved state type (unwraps a factory function) */
type StateOf<S> = S extends { state: infer St } ? (St extends () => infer R ? R : St) : Record<string, never>

/** strip the injected `store` param: keep payload + return; drop the arg when payload is `void` */
type PublicFn<F> = F extends (payload: infer P, ...rest: any[]) => infer R
	? ([P] extends [void] ? () => R : (payload: P) => R)
	: never
/** like PublicFn, but mutators always resolve to `void` at runtime */
type PublicMut<F> = F extends (payload: infer P, ...rest: any[]) => any
	? ([P] extends [void] ? () => void : (payload: P) => void)
	: never

type Methods<S> =
	& (S extends { getters: infer G } ? { [K in keyof G]: PublicFn<G[K]> } : {})
	& (S extends { actions: infer A } ? { [K in keyof A]: PublicFn<A[K]> } : {})
	& (S extends { mutators: infer M } ? { [K in keyof M]: PublicMut<M[K]> } : {})

/** the fully-typed store returned by `createStore`: core + inferred methods */
export type StoreOf<S> = StoreCore<StateOf<S>> & Methods<S>

// ---------------------------------------------------------------------------

/**
 * React hook: subscribe a component to a store and return its state.
 * Pass `fn` to re-render only when it returns true (compares new vs old state).
 */
export function useStore<T>(store: StoreCore<T>, fn?: ShouldRender<T>): T {
	const subscribe = useCallback(
		(listener: Listener<T>) => store._subscribe(listener, fn),
		[store] // `fn` omitted on purpose so the subscribe stays stable across renders
	)
	return useSyncExternalStore(subscribe, () => store.state)
}

/**
 * Create a store from a setup object. The returned store is fully typed:
 * getters/actions/mutators become callable methods (without the `store` param)
 * and `state` is inferred — no cast or hand-written interface required.
 */
export function createStore<S extends StoreSetup>(setup: S): StoreOf<S> {
	const init = setup.state
	const store: StoreCore<any> = {
		state: init == null ? {} : typeof init === 'function' ? (init as () => any)() : structuredClone(init),
		_listeners: new Set<Listener<any>>(),
		_subscribe: (listener, fn) => {
			listener.fn = fn
			store._listeners.add(listener)
			store._listenerChange?.(store, LISTENER_CHANGE.ADD)
			return () => {
				store._listeners.delete(listener)
				store._listenerChange?.(store, LISTENER_CHANGE.REMOVE)
			}
		},
		_update: (oldState, onlyNotify) => {
			if (!onlyNotify) store.state = { ...store.state }
			store._stateChange?.(store, oldState)
			for (const l of store._listeners)
				if (!l.fn || l.fn(store.state, oldState ?? store.state)) l(store.state)
		},
		_listenerChange: setup.onListenerChange,
		_stateChange: setup.onStateChange,
	}
	const self = store as Store

	for (const key in setup.getters)
		self[key] = (payload: any) => setup.getters![key](payload, self)

	for (const key in setup.actions)
		self[key] = async (payload: any) => setup.actions![key](payload, self)

	for (const key in setup.mutators)
		self[key] = (payload: any) => {
			const stub = setup.mutators![key](payload, self)
			if (!stub) return
			// skip when the returned values already match the current state
			if (Object.keys(stub).every((k) => (stub as any)[k] === (store.state as any)[k])) return
			const old = store.state
			store.state = { ...store.state, ...stub }
			store._update(old, true)
		}

	return store as StoreOf<S>
}
