![logo](./res/logo.png)  
[Jon](https://github.com/priolo/jon)


# INDEX
- [Installation](#installation)  
- [Create STORE and VIEW](#create-store-and-view)  
- [Examples](#examples)
- [What we have done?](#what-we-have-done)
- [WHY?](#why)
- [TIPS](#tips)


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


## Examples

- [basic](https://codesandbox.io/s/example-1-5d2tt)
- [multi stores](https://codesandbox.io/s/example-2-iz6l7)
- [action](https://codesandbox.io/s/example-3-hw6hs)
- [material-ui](https://codesandbox.io/s/example-4-0jeqi)

## What we have done?

We have implemented a React STORE-PATTERN with JON  
<https://refactoring.guru/design-patterns/state>  
In practice: When a MUTATOR is executed in a STORE  
the listeners of the STORE update the hooks of the components they use.  
The result is that the component always shows the "current" STATE of the STORE.

### STORE-SETUP

First of all we have created a STORE-SETUP  
(VUEX users will recognize the "style")

```jsx
const mySetup = {
	state: {
		value: "init value"
	},
	getters: {
		getUppercase: (state) => state.value.toUpperCase()
	},
	actions: {
		addAtEnd: (state, char, store) => {
			store.setValue(state.value + char)
		}
	},
	mutators: {
		setValue: (state, value) => ({value})
	}
}
```


### STATE

The value of the STORE right now!  
Inside is all the data needed to render the page.  
For example: the selected tab, texts in the textboxes, array for the lists etc etc ...  
So you know the "useState" scattered on the various components? Now (those values) are in one place!  
- The STATE is a JSON so there should be no complex objects (only string or number)  
and ESPECIALLY no reference to external objects!  
- It is IMMUTABLE. That is, if I have a STATE it always displays the same VIEW  

So we have very cool features: Automatic Tests, Remote Synchronizations, Time Travel ...  


### GETTERS

They are functions that return a value ... typically a property of the STATE being processed.  
A classic example is the concatenation of the first and last name:  

```js
const setup = {
	...
	getters: {
		getName: (state) => `${state.firstName} ${state.lastName}`
	}
}
```

- They are PURE FUNCTIONS and can only use the STATE, other GETTERS of the same STORE in addition, of course, to the `payload`
- Always return a value

However ALL the functions of the STORE have this signature:  
`(state:JSON, payload:any|null, store:Store) => any`  
therefore also the "GETTERS"


### ACTIONS

They make something happen!  
The only functions that can access external APIs (for example send / upload data to the BE).  
They call the GETTERS and SETTERS to organize the STORE.  
In short, if you press a button there will be an ACTION to manage that task. 

- They can be `async` 
- They can call external functions or ACTIONS from another STORE
These functions also have signature:  
`(state:JSON, payload:any|null, store:Store) => any`


### MUTATORS

- the only functions that can replace one STATE with another STATE   
  (STATEs are by themselves immutable)
- They accept a STATE and possibly a paylod and return the new modified STATE

So if you were to have a STATE:  
`{ firstName: "Mario", lastName: "Rossi" }`  
and a MUTATOR:

```js
mutators: {
	setFirstName: (state, firstName) => ({firstName})
}
```

calling the MUTATOR with the ACTION `clickDelete()`:

```js
actions: {
	clickDelete: (state, _, store) => {
		store.setFirstName("")
		...
	}
}
```
the STATE will become   
`{ firstName: "", lastName: "Rossi" }`  

### CREATE STORE

Usare il SETUP dello STORE come TEMPLATE per creare un istanza di STORE

```jsx
import { createStore } from "@priolo/jon"

const mySetup = { ... }

const store = createStore(mySetup)
export default store
```

Esportare L'istanza dello STORE ed il gioco è fatto!

### REACT-COMPONENTS

Nella VIEW, chiamando `useStore`,
mi metto in ascolto sui cambiamenti dello STATE.
Se cio' avviene l'intero componente è aggiornato.

```jsx
import { useStore } from "@priolo/jon"
import myStore from "stores/myStore"

export default function App() {

  	const myState = useStore(myStore)
	const { setValue, getUppercase } = myStore

  	return (<div>
		<h1>{myState.value}</h1><h2>{getUppercase()}</h2>
		<input 
			value={state.value} 
			onChange={(e)=>setValue(e.target.value)} 
		/>
	</div>)
}
```

Note that the functions previously defined in STORE-SETUP now only need the `payload`.  
The `state` and` store` will be passed automatically by JON  
(for example `getUppercase ()` and `setValue (value)`).   

## WHY?

JON is designed to be VERY VERY VERY LIGHT, [Take a look!](https://github.com/priolo/jon/blob/master/src/lib/store/rvx.js)... and this is all

![logo](./res/schema1.png)

# TIPS

## Improve performance (with MEMO)

This library offers the bare minimum  
For the rest, use the official "react" systems  
To optimize a component that uses STOREs:  
[sandbox](https://codesandbox.io/s/test-render-memo-47rt7?file=/src/Cmp1.jsx:0-515)

```jsx
import React, { useMemo } from "react";
import { useStore } from "@priolo/jon";
import myStore from "stores/mystore";

export default function Cmp () {

	const state = useStore(myStore)
	const { setValue } = myStore

	return useMemo( ()=>(<div>

		<h1>{state.value}</h1>
	
		<input 
			value={state.value}
			onChange={(e)=>setValue(e.target.value)} 
		/>
		
	</div>)
	,[state.value])
}
```

## Use the "**store**" parameter as if it were "**this**"
You can use the "store" parameter
as the object that contains the getters / action / mutators
in order to refer to them
```js
{
	...
	actions: {
		fetchCropCycles: async (state, farmId, store) => {
			const { data } = await farmApi.index(farmId)
			store.setCrops(data)
		}
	},
	mutators: {
		setCrops: (state, crops) => ({ crops }),
	}
}
```

## Mutate multiple variable
```js
{
	...
	mutators: {
		// change a variable of the STATE (boring)
		setValue: (state, value, store) => ({ value }),
		// changes two variables of the STATE
		setValue12: (state, {value1, value2}, store) => 
			({ value1, value2 }),
		// changes a property of a variable of the STATE
		setSubValue: (state, name, store) => 
			({ user: { ...state.user, name } }),
		// conditional modification of the STATE
		setValueHasChanged: (state, value, store) => 
			({ value: value, valueHasChanged: state.value!=value }),
	}
}
```

## Break a "**store**" into several files
You can use the "mixStores" tool to merge multiple setup-stores.  
To be able to distribute the code on more files  

```js
import { mixStores } from "@priolo/jon"

const setupBaseAbstract = {
	state: { ... },
	getters: { ... },
	actions: { ... },
	mutators: { ... }
}

const setupConcrete = {
	state: { ... },
	getters: { ... },
	actions: { ... },
	mutators: { ... }
}

const setup = mixStores(setupBaseAbstract, setupConcrete)
```

## Using a "**store**" inside another "**store**"
`/stores/layout.js`
```js
import { createStore } from "@priolo/jon"

export default createStore({
	...
	actions: { 
		dialogOpen: (state, _, store) => {
			...
		},
	},)
}
```
`/stores/user.js`
```js
import { createStore } from "@priolo/jon"
import layoutStore from "../layout"

export default createStore({
	...
	actions: {
		save: async (state, _, store) => {
			...
			layoutStore.dialogOpen()
		}
	},
})
```

## Using a "**store**" in an external function

`/ws/command.js`
```js
import userStore from "stores/user"

export function async apiIndex () {
	await userStore.save()
	console.log(userStore.state.value)
}
```

## Bind two value of distinct STOREs

```js
import { createStore, addWatch } from "@priolo/jon"

const setup = {
	state: {
		value: "init value",
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
})

const store1 = createStore(setup)
const store2 = createStore(setup)

// bind "store1.value" with "store2.value" 
addWatch({
	store: store1,
	actionName: "setValue",
	callback: ({ type, store, key, payload }) => {
		const store1 = store
		store2.setValue(store1.state.value)
	}
})
```

# ROADMAP

- Documentation
- Involvement of the community
- Development of plugins to be applied to the library

# DEVELOPMENT NOTE

If you use a local hard-link in package.json for testing  
delete from "node_moduls" the folders "react", "react-dom" and "react-script"  
to avoid the "Invalid hook call" error