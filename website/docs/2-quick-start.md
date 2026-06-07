---
id: "quick-start"
title: 'Quick start'
sidebar_label: 'Quick start'
sidebar_position: 2
---

## Installation

Create a new app with your favourite tool (CRA, Parcel, Vite...)  
Install Jon

```bash title="npm"
npm install @priolo/jon
```

## Create STORE and VIEW
Replace `App.jsx` with:

```jsx title="/src/App.jsx"
import React from "react";
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
		getUppercase: (_, store) => store.state.value.toUpperCase()
	},
	// They do things! For example: here you have to put API calls to the server
	actions: {
		addAtEnd: (payload, store) => {
			store.setValue(store.state.value + payload)
		}
	},
	// The only ones that can replace the STATE with a new one.
	// NOTE: JON merges the returned property with the previous STATE.
	mutators: {
		setValue: (value, store) => ({value})
	}
}

// create STORE
const myStore = createStore(mySetup)

// use STORE in VIEW
function App() {

	// picks up the current STATE of the "myStore" STORE
  	const state = useStore(myStore)

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
```

[codesandbox](https://codesandbox.io/s/example-1-5d2tt)


## What we have done?

We have implemented a React STORE-PATTERN with JON  
[State Design Pattern](https://refactoring.guru/design-patterns/state)  
In practice: When a MUTATOR of STORE is executed in VIEW  
the listeners of the STORE update the hooks of the components they use.  
The result is that the component always shows the "current" STATE of the STORE.
  
If you are interested in a complete project example...  
### [github: Complete Project](https://github.com/priolo/jon-template)