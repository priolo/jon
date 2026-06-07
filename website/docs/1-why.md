---
title: 'Why'
sidebar_label: 'Why'
sidebar_position: 1
---

> Yet another React library!

We need to [separate the concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)!
In react you usually use the [STATE PATTERN](https://refactoring.guru/design-patterns/state)  
There are many tools to do this:  
- [redux-toolkit](https://redux-toolkit.js.org/)
- [zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [hookstate](https://hookstate.js.org/)
- [recoil](https://recoiljs.org/)

and they are fantastic libraries with their pros and cons.

> And why should I use your `Jon`?

You may not use it, I just made it available.  
However, there are at least two reasons, in my opinion, for choosing it:  

## It is minimalist
You can put the code directly into your project: it's just a `jon_juice.js` file  
and everything will work perfectly (except the `watcher` ...whatever)  
without using any dependencies in `package.json`.

```js title="jon_juice.js"
import { useSyncExternalStore } from 'react'

// HOOK to use the STORE 
export function useStore(store, selector = (state) => state) {
	if (!store) return null
	return useSyncExternalStore(store._subscribe, () => selector(store.state))
}

export function createStore(setup, name) {

	let store = {
		// the current state of the store
		state: setup.state,
		// the listeners that are watching the store
		_listeners: new Set(),
		// add listener to the store
		_subscribe: (listener) => {
			store._listeners.add(listener)
			return () => store._listeners.delete(listener)
		},
	}

	// GETTERS
	if (setup.getters) {
		store = Object.keys(setup.getters).reduce((acc, key) => {
			acc[key] = (payload) => setup.getters[key](payload, store)
			return acc
		}, store)
	}

	// ACTIONS
	if (setup.actions) {
		store = Object.keys(setup.actions).reduce((acc, key) => {
			acc[key] = async (payload) => await setup.actions[key](payload, store)
			return acc
		}, store)
	}

	// MUTATORS
	if (setup.mutators) {
		store = Object.keys(setup.mutators).reduce((acc, key) => {
			acc[key] = payload => {
				const stub = setup.mutators[key](payload, store)
				// if the "mutator" returns "undefined" then I do nothing
				if (stub === undefined) return
				// to optimize check if there is any change
				if (Object.keys(stub).every(key => stub[key] === store.state[key])) return
				store.state = { ...store.state, ...stub }
				store._listeners.forEach(listener => listener(store.state))
			}
			return acc
		}, store)
	}

	return store
}
```

[codesandbox](https://codesandbox.io/s/2-jon-juice-jri7kj)


## Syntax stolen from VUEX 
`Jon` owes a lot to [Vuex](https://vuex.vuejs.org/)  
in my opinion, one of the best frameworks for STORE management:  
it has a syntax that is easy to use and clear.  
... and for this `Jon` will be grateful to `VUEX` forever!





