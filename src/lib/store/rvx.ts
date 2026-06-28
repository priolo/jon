import { useCallback, useSyncExternalStore } from 'react'
import { FnConditionalRendering, LISTENER_CHANGE, ReducerCallback, Store, StoreCore, StoreOf, StoreSetup } from './global'
import { EVENTS_TYPES, pluginEmit } from "./rvxPlugin"



/**
 * React hook that subscribes a component to a STORE and returns its state.
 *
 * By default the component re-renders on every store update. Pass the optional
 * `fn` predicate to re-render only when it returns `true`: it receives the new
 * state and the previous one, so you can compare just the slices you care about.
 *
 * @param store the store to subscribe to
 * @param fn optional predicate `(state, oldState) => boolean`; when provided, the component re-renders only if it returns true
 * @returns the current store state
 * @example
 * // re-render only when `count` changes
 * const state = useStore(store, (state, oldState) => state.count !== oldState.count)
 */
export function useStore<T>(store: StoreCore<T>, fn?: FnConditionalRendering<T>): T {
	const subscribe = useCallback(
		(listener: ReducerCallback<T>) => store._subscribe(listener, fn),
		[store] // `fn` is intentionally omitted so the subscribe stays stable across renders
	)
	return useSyncExternalStore(subscribe, () => store.state)
}

/**
 * Creates a STORE from a setup object.
 *
 * The returned store is **fully typed from the setup alone**: the declared
 * `getters`, `actions` and `mutators` become callable methods (with the injected
 * `store` parameter stripped, so you call them as `store.setValue(payload)`), and
 * `state` is inferred — no cast or hand-written interface required.
 *
 * @param setup the store definition (state, getters, actions, mutators, lifecycle hooks)
 * @returns the store instance, with the declared methods attached and typed
 * @example
 * const counter = createStore({
 *   state: { count: 0 },
 *   getters: { double: (_, store) => store.state.count * 2 },
 *   mutators: { add: (n: number, store) => ({ count: store.state.count + n }) },
 * })
 * counter.add(3)            // typed: expects a number
 * counter.double()          // typed: returns number
 * counter.state.count       // typed: number
 */
export function createStore<S extends StoreSetup>(setup: S): StoreOf<S> {

	const store: StoreCore<any> = {
		state: finalizeState(setup.state),
		_listeners: new Set<ReducerCallback<any>>(),
		/** registers a listener and returns the function that unsubscribes it */
		_subscribe: (listener, fn) => {
			listener.fn = fn
			store._listeners.add(listener)
			store._listenerChange?.(store, LISTENER_CHANGE.ADD)
			return () => {
				store._listeners.delete(listener)
				store._listenerChange?.(store, LISTENER_CHANGE.REMOVE)
			}
		},

		/**
		 * Notifies all listeners of a state change.
		 * @param oldState the state before the change, passed to listeners and to the `onStateChange` hook
		 * @param onlyNotify when false (default) a fresh shallow copy of `state` is created before notifying; pass true when the caller has already replaced `state`
		 */
		_update: (oldState, onlyNotify) => {
			if (!onlyNotify) store.state = { ...store.state }
			store._stateChange?.(store, oldState)
			for (const listener of store._listeners) {
				if (!listener.fn || listener.fn(store.state, oldState ?? store.state)) listener(store.state)
			}
		},

		_listenerChange: setup.onListenerChange,
		_stateChange: setup.onStateChange,
	}

	// the permissive handle injected into every setup function, so siblings
	// (`store.setX(...)`) are callable while the methods are still being attached
	const self = store as Store

	/**
	 * GETTERS
	 */
	for (const key in setup.getters) {
		self[key] = (payload: any) => setup.getters![key](payload, self)
	}

	/**
	 * ACTIONS
	 */
	for (const key in setup.actions) {
		self[key] = async (payload: any) => {
			const result = await setup.actions![key](payload, self)
			pluginEmit(EVENTS_TYPES.ACTION, self, key, payload, result)
			return result
		}
	}

	/**
	 * MUTATORS
	 */
	for (const key in setup.mutators) {
		self[key] = (payload: any) => {
			const stub = setup.mutators![key](payload, self)
			// if the mutator returns "undefined" there is nothing to apply
			if (stub === undefined) return
			// skip the update (and the plugin event) when the returned values match the current state
			if (Object.keys(stub).every((k) => stub[k] === (store.state as any)[k])) return

			const old = store.state
			store.state = { ...store.state, ...stub }

			pluginEmit(EVENTS_TYPES.MUTATION, self, key, payload, null)
			store._update(old, true)
		}
	}

	return store as StoreOf<S>
}

/**
 * Resolves the initial state of a store.
 *
 * Accepts the state directly or as a factory function. A plain object is
 * deep-cloned (via `structuredClone`) so the store does not share references
 * with the caller; a factory is invoked and its result used as-is. A nullish
 * value resolves to an empty object.
 *
 * @param state the state object, a factory returning it, or undefined
 * @returns the resolved initial state
 */
export function finalizeState<T>(state: T | (() => T) | undefined): T {
	if (state == null) return {} as T;
	return typeof state === "function" ? (state as () => T)() : structuredClone(state) as T;
}
