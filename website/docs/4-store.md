---
id: "store"
title: 'Store'
sidebar_label: 'Store'
sidebar_position: 4
---


## CREATE STORE
Use the STORE-SETUP as a TEMPLATE to create a STORE instance
and export the STORE instance

```js title="stores/myStore.js"
import { createStore } from "@priolo/jon"

const mySetup = { 
	// this will be cloned during the creation of the STORE
	state: {
		value: ""
	},
	getters: {
		getUppercase: (_, {state}) => state.value.toUpperCase()
	},
	mutators: {
		setValue: value => ({value})
	}
 }

const store = createStore(mySetup)
export default store
```


## REACT-COMPONENTS
In the VIEW, calling `useStore`,  
the COMPONENT (VIEW) listens for changes to the STATE.  
So when the STATE is changed, the COMPONENTS using that STORE are also updated.

```jsx title="App.jsx"
import { useStore } from "@priolo/jon"
import myStore from "stores/myStore"

export default function App() {

  	const state = useStore(myStore)
	const { setValue, getUppercase } = myStore

  	return (<div>
		<h1>{state.value}</h1><h2>{getUppercase()}</h2>
		<input 
			value={state.value} 
			onChange={(e)=>setValue(e.target.value)} 
		/>
	</div>)
}
```

So the mechanism is simple:
- The store maintains the state  
- If it is modified it ONLY updates the React components that have registered  

![schema 1](/img/schema-1.png)