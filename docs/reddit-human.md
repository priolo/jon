**Title:** I use 40 lines of code that I copy and paste instead of a library like Redux/Zustand

Hi,
I'd like to share an idea about state management in React that I've been applying in my own projects for years.
I don't install any library (Zustand, Redux, Recoil, etc.). I have a micro state manager (I called it **jon**) built on `useSyncExternalStore` — and it's small enough that I don't *install* it, I copy-paste it into the project.

Here's the whole thing:

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
		// state must be plain-serializable: a plain object is deep-cloned; a factory is called as-is
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
		// the mutator returns a partial diff; if it's null/undefined or changes nothing, skip the update (no re-render)
		const stub = setup.mutators[k](payload, store)
		if (stub == null || Object.keys(stub).every(k => stub[k] === store.state[k])) return
		const old = store.state
		store.state = { ...store.state, ...stub }
		for (const l of listeners) if (!l.fn || l.fn(store.state, old)) l(store.state)
	}
	return store
}
```

and... that's it, there's nothing else.

## How I use it

The API is Vuex/Pinia-flavored: you define `state`, `getters`, `actions` and `mutators`. Every function receives the `store` itself as its second argument, so you can call siblings and read `store.state`:

```tsx
const counter = createStore({
	state: { count: 0 },
	getters: {
		isEven: (_, store) => store.state.count % 2 === 0,
	},
	mutators: {
		// mutators are the ONLY thing that changes state; they return a partial diff
		add: (n, store) => ({ count: store.state.count + n }),
	},
})

function Counter() {
	const { count } = useStore(counter)
	return (
		<button onClick={() => counter.add(1)}>
			{count} — {counter.isEven() ? 'even' : 'odd'}
		</button>
	)
}
```

- `mutators` are synchronous and are the only place state changes.
- `actions` are for async / side effects and orchestration — they don't return state, they call mutators.
- `getters` are derived values.
- `useStore(store)` subscribes the component. Pass an optional predicate `(state, oldState) => boolean` to re-render only when the slice you care about actually changed.

I've been using it like this for years and I've never hit a case where it wasn't enough, nor a performance / re-render problem.

## But… why not Zustand?

Fair question — Zustand is also tiny and also built on `useSyncExternalStore`. Two reasons this exists:

1. **I copy-paste it instead of installing it.** The core is ~40 lines and stable, so it lives *in* my project. No dependency, no version bumps, no supply-chain surface. If I need to change something, I own the code.
2. **The Vuex-style shape** (`state / getters / actions / mutators`) is how my brain organizes a store, and it forces a clear line between "sync state change" (mutators) and "async / side effects" (actions).

It's not "better than Zustand" — it's "small enough that installing a dependency for it felt silly".

## An unexpected bonus with LLMs

Because the whole thing is ~40 lines that live in the repo, an LLM coding assistant doesn't need to read any docs to use it: the entire implementation is right there in context, so it just figures out how it works and writes correct stores on the first try. Zero API surface to hallucinate. That turned out to be a surprisingly nice side effect of "no library".

---

It's a personal project; for my day job I import an npm version with better type inference and some utilities, but the core behavior is exactly what I shared here.

So — am I crazy, or does this approach actually make sense?
Go easy on me :)

p.s.: Written without AI, but I had it translated because English isn't my mother tongue and I didn't want to ruin the readability. The project is mine too — I used AI only for the web page, the examples and the tests.
