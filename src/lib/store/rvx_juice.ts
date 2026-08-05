/**
 * jon store — self-contained React state management. Single file, no deps except react.
 * Copy this file into your project as-is; nothing to install.
 *
 * A store is created from a "setup" object with 4 sections:
 *   state    — initial state: plain object (deep-cloned) or a `() => state` factory
 *   mutators — the ONLY way to change state. Synchronous. Return a PARTIAL state
 *              object (shallow-merged into the current state); return undefined
 *              to skip the update.
 *   actions  — sync/async side effects and orchestration. They don't return state:
 *              they call mutators through the injected `store` handle.
 *   getters  — derived/computed values.
 * Every setup function receives `(payload, store)` — treat `store` like `this`:
 * read `store.state`, call siblings as `store.setX(...)`.
 *
 * RULES (this is NOT redux/zustand — common mistakes):
 * - Call methods directly on the store, passing ONLY the payload: `myStore.setCount(3)`.
 * - Never write `store.state` directly; only mutators replace state.
 * - `useStore(store, fn?)`: `fn(state, oldState) => boolean` is a re-render
 *   PREDICATE, not a selector. `useStore` always returns the full state. The
 *   predicate must be PURE (decide only from state/oldState, not captured vars):
 *   it is bound once at subscribe time and would go stale otherwise.
 * - State is compared by REFERENCE, not deep-equal: a mutator returning a new
 *   object/array that is deeply equal still re-renders (return undefined to skip).
 *
 * EXAMPLE
 * const counterStore = createStore({
 *   state: { count: 0, label: "" },
 *   getters: {
 *     isEven: (_, store) => store.state.count % 2 == 0,
 *   },
 *   mutators: {
 *     setCount: (count) => ({ count }),      // partial: `label` is untouched
 *     setLabel: (label) => ({ label }),
 *   },
 *   actions: {
 *     fetchCount: async (url, store) => {
 *       const res = await fetch(url)
 *       store.setCount(await res.json())
 *     },
 *   },
 * })
 *
 * function Counter() {
 *   const state = useStore(counterStore)
 *   return <button onClick={() => counterStore.setCount(state.count + 1)}>
 *     {state.count} — {counterStore.isEven() ? "even" : "odd"}
 *   </button>
 * }
 *
 * Bonus for AI agents: store actions/mutators are `name(payload) => result`, which
 * maps 1:1 onto an LLM tool/function declaration — the agent and the UI can then
 * mutate the same reactive state (see storeToAiTools.ts in the jon repository).
 */
import { useCallback, useSyncExternalStore } from 'react'

/** Store handle: `state` plus the setup's methods (not type-checked). */
export type Store<T = any> = { state: T } & Record<string, any>

/** React hook: subscribes the component and returns the state. `fn` => re-render only if it returns true. */
export function useStore<T>(store: Store<T>, fn?: (state: T, oldState: T) => boolean): T {
	const subscribe = useCallback((listener: any) => store._subscribe(listener, fn), [store])
	return useSyncExternalStore(subscribe, () => store.state)
}

/** Creates a store from the setup: getters/actions/mutators become methods (without the `store` param). */
export function createStore(setup: any): Store {
	const listeners = new Set<any>()
	const store: Store = {
		// a plain object is deep-cloned; a factory is called as-is
		state: typeof setup.state == 'function' ? setup.state() : structuredClone(setup.state ?? {}),
		_subscribe: (listener: any, fn: any) => {
			listener.fn = fn
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
	}
	for (const k in setup.getters) store[k] = (payload: any) => setup.getters[k](payload, store)
	for (const k in setup.actions) store[k] = async (payload: any) => setup.actions[k](payload, store)
	for (const k in setup.mutators) store[k] = (payload: any) => {
		// the mutator returns a partial diff; if it's undefined/null or changes nothing, skip the update (no re-render)
		const stub = setup.mutators[k](payload, store)
		if (stub == null || Object.keys(stub).every(k => stub[k] === store.state[k])) return
		const old = store.state
		store.state = { ...store.state, ...stub }
		for (const l of listeners) if (!l.fn || l.fn(store.state, old)) l(store.state)
	}
	return store
}
