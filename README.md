![logo](./res/logo.png)  
[Jon](https://github.com/priolo/jon)

# INDEX
- [Quick start](#quick-start)  
	- [Installation](#installation)  
	- [Create STORE and PROVIDER](#create-store-and-provider)  
	- [Use STORE](#use-store)  
- [Examples](#examples)
- [What we have done?](#what-we-have-done)
- [Why](#why)
- [Is Production Ready](#is-production-ready)
- [TIPS](#tips)
- [API](./res/api/index.md)


# Quick start

### Installation

`npm install @priolo/jon`

### Create STORE and PROVIDER
```jsx
import { createStore, useStore } from '@priolo/jon';

// SETUP of STORE
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

// CREATE STORE
const myStore = createStore(mySetup)

// USE STORE
function App() {

  const state = useStore(myStore) // useStore17 if React version is < 18
  const { setValue, getUppercase } = myStore

  return (<div>
	<h1>{state.value}</h1><h2>{getUppercase()}</h2>
	<input 
		value={state.value} 
		onChange={(e)=>setValue(e.target.value)} 
	/>
  </div>);
}

// React 18
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<React.StrictMode><App /></React.StrictMode>)
// React <=17
//ReactDOM.render(<App />, document.getElementById("root") )
```


[codesandbox](https://codesandbox.io/s/example-1-5d2tt)

# Examples

- [basic](https://codesandbox.io/s/example-1-5d2tt)
- [multi stores](https://codesandbox.io/s/example-2-iz6l7)
- [action](https://codesandbox.io/s/example-3-hw6hs)
- [material-ui](https://codesandbox.io/s/example-4-0jeqi)

# What we have done?

We have implemented a React PROVIDER-PATTERN with JON

## STORE-SETUP

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
- The STATE is a JSON so there should be no complex objects (only string and number)  
and ESPECIALLY no reference to external objects!  
- It is unique. That is, if I have a STATE it always displays the same VIEW  

So we have very cool features: Automatic Tests, Remote Synchronizations, Time Travel ...  


### GETTERS

They are functions that return a value ... typically a property of the STATE being processed.  
A classic example is the concatenation of the first and last name:  

```js
getters: {
	getName: (state) => `${state.firstName} ${state.lastName}`
}
```

- They are pure functions and can only use the STATE, other GETTERS of the same STORE in addition, of course, to the `payload`
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

- The only functions that change the STATE
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


## MULTI-PROVIDER

So we have created a MULTI-STORE-PROVIDER
even if in this example there is only one STORE

```jsx
<MultiStoreProvider setups={{myStore:mySetup}}>
	<App />
</MultiStoreProvider>
```

- `mySetup`: object described above
- `myStore`: identifying name (and unique) of the STORE

In the PROVIDER there is the instance of the STORE
He eventually updates his `children` components.


## REACT-COMPONENTS

At this point we can use the created STOREs
inside the React components through the HOOKS

```jsx
import { useStore } from "@priolo/jon";

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

`useStore` allows you to pull into the STORE (by its name).  
Destructuring it yields: `state`,` actions`, `getters` and` mutators`.  
Note that the functions previously defined in STORE-SETUP now only need the `payload`  
`state` and` store` will be passed automatically by JON  
(for example `getUppercase ()` and `setValue (value)`).   

# FAQ

## Why?

JON is designed to be VERY VERY LIGHT and integrated with React.  
Basically it is a utility to use native [PROVIDERS](https://it.reactjs.org/docs/hooks-reference.html#usecontext), [Take a look!](https://github.com/priolo/jon/blob/develop/src/lib/store/rvxProviders.jsx)... and this is all

![logo](./res/schema1.png)

also, for development, you can use "React Developer Tools"  

![chrome inspector](res/screenshot1.png)

## Is Production Ready?

"JON" is not a used library.  
I don't know a lot of use cases!  
I can tell you that I use it in three medium-sized professional projects (CRA and NEXT).  
Furthermore JON is a VERY LIGHT lib.  
You can always replace it on the fly with React's "native" PROVIDERS.   
This is an example: [sandbox](https://codesandbox.io/s/react-template-ln4gh?file=/index.js)  
>You can use a series of "Providers" instead of "MultiStoreProvider"  
>and share the "reducer"

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

```js
import mixStores from "@priolo/jon"
import store2 from "./store2"

const storeBaseAbstract = {
	state: { ... },
	getters: { ... },
	actions: { ... },
	mutators: { ... }
}

const storeConcrete = {
	state: { ... },
	getters: { ... },
	actions: { ... },
	mutators: { ... }
}

export default mixStores(storeBaseAbstract, storeConcrete)
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


# ROADMAP

- Involvement of the community
- Self-test plugin
- Remote synchronization plugin


# DEVELOPMENT NOTE

If you use a local hard-link in package.json for testing
delete from "node_moduls" the folders "react", "react-dom" and "react-script"
to avoid the "Invalid hook call" error