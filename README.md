![logo](./res/logo.png)  
[Jon](https://github.com/priolo/jon)

## INDEX
- [Quick start](#quick-start)  
		- [Installation](#installation)  
		- [Create STORE](#create-store)  
		- [Create PROVIDER](#create-provider)  
		- [Use STORE](#use-store)  
- [Why](#why)
- [Production ready?](#production-ready)
- [Examples](#examples)
- [API](#api)
	- [MultiStoreProvider](#multistoreprovider)
	- [getStore( storeName:string ):store](#getstore-storenamestring-store)
	- [useStore( storeName:string ):store](#usestore-storenamestring-store)
	- [STORE SETUP JSON](#store-setup-json)
- [TIPS](#tips)


# Quick start

### Installation

`npm install @priolo/jon`

### Create STORE
`my_app/myStore.js`
```jsx
export default {
	state: {
		value: "init value",
	},
	getters: {
		getUppercase: (state) => state.value.toUpperCase(),
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
}
```

### Create PROVIDER
`my_app/index.js`
```js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { MultiStoreProvider } from '@priolo/jon';
import myStore from "./myStore"

const rootElement = document.getElementById("root");
ReactDOM.render(
	<MultiStoreProvider setups={{ myStore }}>
		<App />
	</MultiStoreProvider>,
	rootElement
);
```

### Use STORE
`my_app/App.js`
```jsx
import { useStore } from "@priolo/jon";
import React from "react";

export default function App() {

  const { state, setValue, getUppercase } = useStore("myStore")

  return (<div>
	<h1>{state.value}</h1><h2>{getUppercase()}</h2>
	<input 
		value={state.value} 
		onChange={(e)=>setValue(e.target.value)} 
	/>
  </div>);
}
```

[sandbox](https://codesandbox.io/s/example-1-5d2tt)



# Why
How why??!  
You want to pass component data to component  
until what complexity will be unmanageable??? NO!  
JON is designed to be VERY LIGHT and integrated with React.  
Basically it is a utility to use native [PROVIDERS](https://it.reactjs.org/docs/hooks-reference.html#usecontext), [Take a look!](https://github.com/priolo/jon/blob/develop/src/lib/store/rvxProviders.jsx)... and this is all

![logo](./res/schema1.png)

# Production-ready? {#production-ready}
"JON" is not a used library.  
I don't know a lot of use cases!  
I can tell you that I use it in three medium-sized professional projects.  
Furthermore JON is a VERY LIGHT lib.  
You can always replace it on the fly with React's "native" PROVIDERS.   
This is an example: [sandbox](https://codesandbox.io/s/react-template-ln4gh?file=/index.js)
>You can use a series of "Providers" instead of "MultiStoreProvider"  
>and share the "reducer"


# Examples

- [basic](https://codesandbox.io/s/example-1-5d2tt)
- [multi stores](https://codesandbox.io/s/example-2-iz6l7)
- [action](https://codesandbox.io/s/example-3-hw6hs)
- [material-ui](https://codesandbox.io/s/example-4-0jeqi)



# API

## MultiStoreProvider
REACT PROVIDER that contains all REDUCERS  
[code](https://codesandbox.io/s/example-4-0jeqi?file=/index.js:305-351)

## getStore( storeName:string ):store
Returns a STORE by its name
It is useful for using a STORE outside a REACT COMPONENT  
[code](https://codesandbox.io/s/example-4-0jeqi?file=/stores/user.js:159-197)

## useStore( storeName:string ):store
Use a STORE by its name
It is useful for using a STORE in a REACT COMPONENT  
[code](https://codesandbox.io/s/example-4-0jeqi?file=/components/Body.jsx:191-233)

## STORE SETUP JSON
```js
{
	// initial state of STORE
	state: {
		value: "init value",
		...
	},
	// Function called once. Used to initialize the store. 
	// For example if I have to listen to an event 
	init: (store) => {
		...
	},
	// returns a value
	getters: {
		getUppercase: (state, payload, store) => state.value.toUpperCase(),
		...
	},
	// performs an action. It can be asynchronous
	actions: {
		fetch: async (state, payload, store) => {
			const {response} = await ajax.get(`my_server`)
			store.setValue(response)
		},
		...
	},
	// allows you to change the STATUS
	// must return a key-value object
	// this object will be merged to STATE
	mutators: {
		setValue: (state, value, store) => ({ value }),
		...
	},
	// Intercepts when a "mutator" is called
	watch: {
		"otherStore": {
			// store: THIS store
			// value: the new value passed to the "mutator"
			"setValue": ( store, value ) => {
				// code
			}
		}
	}
	
}
```

As you may have noticed: the functions always have the same signature:  
**fn (state, payload, store) => {}**  
parameters:  
- **state**:  
  is the current STATE of the STORE (read only)
- **payload**:  
  any parameter passed to the function (optional)
- **store**:  
  it's the same STORE where the function is (a kind of *this*)



# _syncAct

multiple call to action problem:  
If the actions use the same variables  
may not update the STATE correctly ([look here](https://it.reactjs.org/docs/hooks-reference.html#functional-updates))  
In this case use the `_syncAct` function  
[sandbox](https://codesandbox.io/s/example-sync-1-fm05e?file=/src/App.js)

```js
{  
	...
	actions: {
		// NOT WORK: value = 1
		notWork: (state, value, store ) => {
			store.update(1)
			store.update(1)
		},
		// WORK: value = 2
		work: (state, value, store ) => {
			store.update(1)
			store._syncAct(update, 1)
		},
		// WORK 3 TIME: value = 3
		work3: async (state, value, store ) => {
			store.update(1)
			await store._syncAct(update, 1)
			await store._syncAct(update, 1)
		},

		update: (state, step, store) => {
			store.setValue(state.value + step)
		},
	},
	mutators: {
		setValue: (state, value, store) => ({ value }),
	}
}
```


# TIPS

## Improve performance (with MEMO)

This library offers the bare minimum  
For the rest, use the official "react" systems  
To optimize a component that uses STOREs:  
[sandbox](https://codesandbox.io/s/test-render-memo-47rt7?file=/src/Cmp1.jsx:0-515)

```jsx
import React, { useMemo } from "react";
import { useStore } from "@priolo/jon";

export default function Cmp () {

	const { state, setValue } = useStore("myStore")

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

`/stores/index.js`
```js
import mixStores from "@priolo/jon"
import store2 from "./store2"

const store1 = {
	state: { ... },
	getters: { ... },
	actions: { ... },
	mutators: { ... }
}

export default mixStores(store1, store2)
```
`/stores/store2.js`
```js
const store2 = {
	state: { ... },
	getters: { ... },
	actions: { ... },
	mutators: { ... }
}

export default store2
```

## Using a "**store**" inside another "**store**"
`/stores/layout.js`
```js
export default {
	...
	actions: { 
		dialogOpen: (state, payload, store) => {
			...
		},
	},
}
```
`/stores/store2.js`
```js
import { getStore } from "@priolo/jon"

export default {
	...
	actions: {
		save: (state, payload, store) => {
			const { dialogOpen } = getStore("layout")
			dialogOpen()
		}
	},
}
```

## Using a "**store**" in an external function
`/stores/store2.js`
```js
import { getStore } from "@priolo/jon"

export function async apiIndex () {
	const { state, myAction, myGetter, myMutator } = getStore("myStore")
	// the "actions" can be asynchronous
	// and can return a value
	const {data} = await myAction()
	console.log(state.value)
}
```

## Check a "**store**" from the inspector

![chrome inspector](res/screenshot1.png)
