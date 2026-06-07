---
id: "tips"
title: 'Tips'
sidebar_label: 'Tips'
sidebar_position: 20
---


## Break a **STORE** into several files
You can use the "mixStores" tool to merge multiple SETUP-STORES.  
To be able to distribute the code on more files  
[sandbox](https://codesandbox.io/s/example-mixstores-zopru)

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


## Improve performance (with Selector)
You can use the `selector` argument of `useStore` to select only a part of the state.
The component will only re-render if the selected value changes.

```jsx
const value = useStore(myStore, state => state.value)
```


## Improve performance (with MEMO)
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

Here we render ONLY IF the `value` property of the `state` changes.  
Or you can use `useStoreNext` to simplify:


```jsx
import React, { useMemo } from "react";
import { useStoreNext } from "@priolo/jon";
import myStore from "stores/mystore";

export default function Cmp () {

	const state = useStoreNext( myStore, ( currentState, oldState ) => currentState.value!=oldState.value )
	const { setValue } = myStore

	return <div>
		<h1>{state.value}</h1>
		<input 
			value={state.value}
			onChange={(e)=>setValue(e.target.value)} 
		/>
	</div>
}
```



## Bind two value of distinct STOREs
[sandbox](https://codesandbox.io/s/example-watch-n8jj2?file=/src/index.js)

```js
import { createStore, addWatch } from "@priolo/jon"

const setup = {
	state: {
		value: "init value",
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
}

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

## Use the "**store**" parameter as if it were "**this**"
You can use the "store" parameter
as the object that contains the getters / action / mutators
in order to refer to them
```js
{
	...
	actions: {
		fetchCropCycles: async (farmId, store) => {
			const { data } = await farmApi.index(farmId)
			store.setCrops(data)
		}
	},
	mutators: {
		setCrops: crops => ({ crops }),
	}
}
```


## Mutate multiple variable
```js
{
	...
	mutators: {
		// change a variable of the STATE (boring)
		setValue: (value, store) => ({ value }),
		// changes two variables of the STATE
		setValue12: ({value1, value2}, store) => 
			({ value1, value2 }),
		// changes a property of a variable of the STATE
		setSubValue: (name, {state}) => 
			({ user: { ...state.user, name } }),
		// conditional modification of the STATE
		setValueHasChanged: (value, {state}) => 
			({ value: value, valueHasChanged: state.value!=value }),
	}
}
```


## Using a "**store**" inside another "**store**"
`/stores/layout.js`
```js
import { createStore } from "@priolo/jon"

export default createStore({
	...
	actions: { 
		dialogOpen: (_, store) => {
			...
		},
	},
})
```
`/stores/user.js`
```js
import { createStore } from "@priolo/jon"
import layoutStore from "../layout"

export default createStore({
	...
	actions: {
		save: async (_, store) => {
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