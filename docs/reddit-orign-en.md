Hello,  
I'd like to share an idea of mine about state management in React that I've been applying in my projects for years.  
I don't use any library (Zustand, Redux, Recoil, etc.) but I have a micro state manager (I called it **jon**) and it's based on `useSyncExternalStore`.  
Here it is:  

```ts
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
```
and... that's it, there's nothing else!

I use it like vuex:  
I define state, getters, actions and mutators  
and then I use `useStore` in React components to read the state and react to changes.
I haven't found use cases where it isn't enough,
and I've never had performance or re-rendering problems.  
Here's the [repo](https://priolo.github.io) and [documentation](https://priolo.github.io/jon)



I usually use a client-side routing library but I could also do without it, and use only the state manager.

An unexpected advantage is that an LLM doesn't need to read the documentation to understand how it works, it already has all the code available, so it can understand how it works and how to use it.

It's a personal project; for my actual work I import an npm version that has better handling of types and utilities, but the basic behavior is the one I shared here.


I wonder if I'm crazy or if this approach makes sense.
Go easy on me :)

p.s.:
Written without AI, but I had it translated because my native language isn't English and I didn't want to ruin the readability of the post.
The project is also mine. I used AI for the web page and to generate the examples and tests.
