import { useSyncExternalStore } from 'react'
import { FnConditionalRendering, LISTENER_CHANGE, ReducerCallback, StoreCore, StoreSetup } from './global'
import { EVENTS_TYPES, pluginEmit } from "./rvxPlugin"



/**
 * HOOK to use the STORE in React
 * @example
 * const state = useStore(store, (state) => ({ count: state.count }) )
 */
export function useStore<T, S = T>(
	store: StoreCore<T>, 
	selector: (state: T) => S = (state: any) => state
): S {
	return useSyncExternalStore(store._subscribe, () => selector(store.state))
}

/**
 * use a STORE only if the condition evaluates to true
 * @example
 * const state = useStoreNext(store, (state, oldState) => state.count !== oldState.count)
 */
export function useStoreNext<T>(store: StoreCore<T>, fn?: FnConditionalRendering<T>): T {
	return useSyncExternalStore((listener) => store._subscribe(listener, fn), () => store.state)
}

/**
 * create a STORE with a SETUP-STORE
 */
export function createStore<T>(setup: StoreSetup<T>): StoreCore<T> & Record<string, any> {

	let store: StoreCore<T> = {
		// the current state of the store
		state: finalizeState(setup.state),

		// the listeners that are watching the store
		_listeners: new Set<ReducerCallback<T>>(),

		// add listener to the store. Called by "useSyncExternalStore"
		_subscribe: (listener, fn) => {
			listener.fn = fn
			store._listeners.add(listener)
			store._listenerChange?.(store, LISTENER_CHANGE.ADD)
			return () => {
				store._listeners.delete(listener)
				store._listenerChange?.(store, LISTENER_CHANGE.REMOVE)
			}
		},

		/** distributes the update to all STORE listeners */
		_update: (oldState?: T) => {
			store.state = { ...store.state }
			store._stateChange?.(store, oldState)
			for (const listener of store._listeners) {
				if (!listener.fn || listener.fn(store.state, oldState || store.state)) listener(store.state)
			}
		},

		_listenerChange: setup.onListenerChange,
		_stateChange: setup.onStateChange,
	}

	/**
	 * GETTERS
	 */
	if (setup.getters) {
		Object.keys(setup.getters).forEach((key) => {
			(store as any)[key] = (payload: any) => {
				return setup.getters![key](payload, store)
			}
		})
	}

	/**
	 * ACTIONS
	 */
	if (setup.actions) {
		Object.keys(setup.actions).forEach((key) => {
			(store as any)[key] = async (payload: any) => {
				const result = await setup.actions![key](payload, store)
				pluginEmit(EVENTS_TYPES.ACTION, store, key, payload, result)
				return result
			}
		})
	}

	/**
	 * MUTATORS
	 */
	if (setup.mutators) {
		Object.keys(setup.mutators).forEach((key) => {
			(store as any)[key] = (payload: any) => {
				const stub = setup.mutators![key](payload, store)
				// if the "mutator" returns "undefined" then I do nothing
				if (stub === undefined) return
				// to optimize check if there is any change and dispath on plugins
				if (Object.keys(stub).every((k) => stub[k] === (store.state as any)[k])) return
				
				const old = store.state
				store.state = { ...store.state, ...stub }
				
				pluginEmit(
					EVENTS_TYPES.MUTATION,
					store,
					key,
					payload,
					null,
				)
				store._update(old)
			}
		})
	}

	return store as StoreCore<T> & Record<string, any>
}

/**
 * Extracts the value of a "state" (accepts a direct object or a function returning the state)
 */
export function finalizeState<T>(state: T | (() => T) | undefined): T {
	if (!state) return {} as T;
	return typeof state === "function" ? (state as () => T)() : cloneDeep(state) as T;
}

/**
 * Fa un clone "deep" di un oggetto
 * @param obj oggetto da clonare
 * > ATTENZIONE: gli `undefined` vengono trasformati in `null`
 */
 function cloneDeep(obj:any):any {
    if (obj == undefined) return undefined;
    return JSON.parse(JSON.stringify(obj));
}