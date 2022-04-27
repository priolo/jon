Let's get to the point:  
In React you SHOULD separate the STATE from the VIEW (with STOREs).  
COULD you use Redux but WANT to use VUEX? Then use [JON](https://github.com/priolo/jon)!  


## Installation

`npm install @priolo/jon`


## Create STORE and VIEW

```jsx
import React from "react";
//import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { createStore, useStore } from '@priolo/jon';

// create STORE-SETUP
const mySetup = {
	// The immutable single source of truth.
	state: {
		value: "init value"
	},
	// Pure functions return a "processed" value of the STATE.
	getters: {
		getUppercase: (state, _, store) => state.value.toUpperCase()
	},
	// They do things! For example: here you have to put API calls to the server
	actions: {
		addAtEnd: (state, payload, store) => {
			store.setValue(state.value + payload)
		}
	},
	// The only ones that can replace the STATE with a new one.
	// NOTE: JON merges the returned property with the previous STATE.
	mutators: {
		setValue: (state, value, store) => ({value})
	}
}

// create STORE
const myStore = createStore(mySetup)

// use STORE in VIEW
function App() {

	// picks up the current STATE of the "myStore" STORE
  	const state = useStore(myStore) // "useStore17" if React version is < 18

	// call ACTION. NOTE:  you must pass ONLY the "payload"
	const handleClick = e => myStore.addAtEnd("!")

	// render
	return (<div>
		<h1>{state.value}</h1><h2>{myStore.getUppercase()}</h2>
		<input 
			value={state.value} 
			// call MUTATOR. NOTE: you must pass ONLY the "payload"
			onChange={(e)=>myStore.setValue(e.target.value)} 
		/>
		<button onClick={handleClick}>add !</button>
	</div>);
}

// React 18
const root = createRoot(document.getElementById('root'))
root.render(<React.StrictMode><App /></React.StrictMode>)
// React <=17
//ReactDOM.render(<App />, document.getElementById("root") )
```

[codesandbox](https://codesandbox.io/s/example-1-5d2tt)


## FAQ

### **I don't want to include another library in my package.json!**
Copy JON into your project:

```js
import { useEffect, useState, useSyncExternalStore } from 'react'

// HOOK to use the STORE in React v18
export function useStore(store) {
	return useSyncExternalStore(
		store._subscribe,
		() => store.state
	)
}

// HOOK to use the STORE in React v17
export function useStore17(store) {
	const [state, setState] = useState(store.state)
	useEffect(() => {
		const listener = (s) => setState(s)
		const unsubscribe = store._subscribe(listener)
		return unsubscribe
	}, [store])

	return state
}

export function createStore(setup, name) {

	let store = {

		// the current state of the store
		state: JSON.parse(JSON.stringify(setup.state)),

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
			acc[key] = (payload) => setup.getters[key](store.state, payload, store)
			return acc
		}, store)
	}

	// ACTIONS
	if (setup.actions) {
		store = Object.keys(setup.actions).reduce((acc, key) => {
			acc[key] = async (payload) => await setup.actions[key](store.state, payload, store)
			return acc
		}, store)
	}

	// MUTATORS
	if (setup.mutators) {
		store = Object.keys(setup.mutators).reduce((acc, key) => {
			acc[key] = payload => {
				const stub = setup.mutators[key](store.state, payload, store)
				if (stub === undefined) return
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
Example:  
[codesandbox](https://codesandbox.io/s/example-juice-6mqqps?file=/src/lib.js)

### **Yes, but how does it work?**
In practice: When a MUTATOR is executed in a STORE  
the listeners of the STORE update the hooks of the components they use.  
The result is that the component always shows the "current" STATE of the STORE.

### **Shut up and let me see the code!**

ok ok ... here there is only one "callback" and not the "listener" 
but that's roughly how it works.
This is the reference:
<https://reactjs.org/docs/hooks-reference.html#usesyncexternalstore>

```jsx
import React, { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";

// create EXTERNAL STORE
const myStore = {
	state: {
		value: ""
	},
	callback: null,
	subscribe: (callback) => {
		myStore.callback = callback
		// unsubscribe
		return () => myStore.callback = null
	},
	getSnapshot: () => myStore.state,
	changeState: (newState) => {
		myStore.state = newState
		myStore.callback()
	}
}

// use STORE in VIEW
function App() {

	const currentState = useSyncExternalStore(
		myStore.subscribe,
		myStore.getSnapshot,
	)

	const handleClick = e => myStore.changeState({value: currentState.value + "!"})

	// render
	return (<div>
		<input 
			value={currentState.value} 
			// call MUTATOR. NOTE: you must pass ONLY the "payload"
			onChange={(e)=>myStore.changeState({value:e.target.value})} 
		/>
		<button onClick={handleClick}>add !</button>
	</div>);
}

// React 18
const root = createRoot(document.getElementById('root'))
root.render(<React.StrictMode><App /></React.StrictMode>)
```
[codesandbox](https://codesandbox.io/s/example-core-store-lou5kv?file=/src/index.js)

### **Ok little bastard, I want a todo**
That's not very nice of you, anyway here it is:
[codesandbox](https://codesandbox.io/s/to-do-p24qhx?file=/src/store.js)

### **I don't trust it! What if you die? Who updates it?**
I feel you!!! That's why you should use JON  
It's tiny and only does what you need.   
If I die, you can always edit it yourself easily or contribute  
...in short, do what you want!