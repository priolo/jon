## INDEX
- [Quick start](#quick-start)  
		- [Installation](#installation)  
		- [Create STORE](#create-store)  
		- [Create PROVIDER](#create-provider)  
		- [Use STORE](#use-store)  
- [Why](#why)
- [Examples](#examples)
- [API](#api)
	- [setupStore( setup:JSON ):void](#setupstore-setupjson-void)
	- [MultiStoreProvider](#multistoreprovider)
	- [getStore( storeName:string ):store](#getstore-storenamestring-store)
	- [useStore( storeName:string ):store](#usestore-storenamestring-store)
	- [STORE SETUP JSON](#store-setup-json)
- [TIPS](#tips)


# Quick start

### Installation

`npm install @priolo/iistore`

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
	actions: {
		fetch: async (state, payload, store) => {
			//const {response} = await ajax.get(`my_server`)
			//store.setValue(response)
		}
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

import { MultiStoreProvider, setupStore } from '@priolo/iistore';
import myStore from "./myStore"
setupStore({ myStore })

const rootElement = document.getElementById("root");
ReactDOM.render(
  <MultiStoreProvider>
    <App />
  </MultiStoreProvider>,
  rootElement
);
```

### Use STORE
`my_app/App.js`
```jsx
import { useStore } from "@priolo/iistore";
import React from "react";

export default function App() {

  const { state, setValue, getUppercase } = useStore("myStore")

  return (<div>
      <h1>{state.value}</h1><h2>{getUppercase()}</h2>
      <input onChange={(e)=>setValue(e.target.value)} />
  </div>);
}
```

[online](https://codesandbox.io/s/react-store-example-1-ct8r4)



# Why
How why??!  
You want to pass component data to component  
until what complexity will be unmanageable? He ??? NO!  
And then you will have to use the [PROVIDERS](https://it.reactjs.org/docs/hooks-reference.html#usecontext)  
this utility is REALLY VERY VERY VERY LIGHT  
[Take a look!](https://gitlab.com/priolo22/iistore/-/tree/master/src/lib/store) It is basically like using native [useReducer](https://it.reactjs.org/docs/hooks-reference.html#usereducer)   



# Examples

- [basic](https://codesandbox.io/s/react-store-example-1-ct8r4)
- [multi stores](https://codesandbox.io/s/iistore-examples-2-b8xml)
- [action](https://codesandbox.io/s/react-store-example-3-fepd8)
- [material-ui](https://codesandbox.io/s/react-stores-example-4-43b3g)



# API

## setupStore( setup:JSON ):void
Initialization!
Create CONTEXTS and STORES from a SETUP-STORE dictionary

## MultiStoreProvider
REACT PROVIDER that contains all REDUCERS

## getStore( storeName:string ):store
Returns a STORE by its name
It is useful for using a STORE outside a REACT COMPONENT

## useStore( storeName:string ):store
Use a STORE by its name
It is useful for using a STORE in a REACT COMPONENT

## STORE SETUP JSON
```js
{
	// initial state of STORE
	state: {
		value: "init value",
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
	
}
```

*ATTENTION!!!*  
MUTATORS cannot call other MUTATORS  
this would not update the state  
To call multiple MUTATORS use an ACTION  
```js
{  
	...
	actions: {
		onChangeValueMulti: (state, value, store ) => {
			store.setValue1(value)
			store.setValue2(value)
			...
		}
	},
	mutators: {
		// not work
		setValue: (state, {value1, value2}, store) => {
			store.setValue1(value1)
			return { value2 }
		},
		setValue1: (state, value, store) => ({ value }),
		setValue2: (state, value, store) => ({ value }),
		// OR change the whole state at once
		setValue12: (state, {value1, value2}, store) => 
			({ value1, value2 }),
		setValueHasChanged: (state, value, store) => 
			({ value: value, valueHasChanged: state.value!=value }),
	}
}
```


As you may have noticed: the functions always have the same signature:  
**fn (state, payload, store) => {}**  
parameters:  
- **state**:  
  is the current STATE of the STORE (read only)
- **payload**:  
  is any parameter (optional)
- **store**:  
  it's the same STORE where the function is (a kind of *this*)

# TIPS

### Use the "**store**" parameter as if it were "**this**"
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

### Break a "**store**" into several files
`/stores/index.js`
```js
import mixStores from "@priolo/iistore"
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

### Using a "**store**" inside another "**store**"
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
import { getStore } from "@priolo/iistore"

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

### Using a "**store**" in an external function
`/stores/store2.js`
```js
import { getStore } from "@priolo/iistore"

export function async apiIndex () {
	const { state, myAction, myGetter, myMutator } = getStore("myStore")
	// the "actions" can be asynchronous
	// and can return a value
	const {data} = await myAction()
	console.log(state.value)
}
```

### Check a "**store**" from the inspector