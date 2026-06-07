---
id: "store-setup"
title: 'Store Setup'
sidebar_label: 'Store Setup'
sidebar_position: 3
---

> OK! I'll give you a chance

Thank you! First let's see what's inside the STORE-SETUP  
This object then allows you to instantiate a STORE with `createStore 

```jsx
import { createStore } from "@priolo/jon"

const mySetup = {
	state: {
		value: "init value"
	},
	getters: {
		getUppercase: (_, store) => store.state.value.toUpperCase()
	},
	actions: {
		addAtEnd: (char, store) => {
			store.setValue(store.state.value + char)
		}
	},
	mutators: {
		setValue: (value, store) => ({value})
	}
}

const myStore = createStore(mySetup)
```


## STATE
This is the data required to render the page.  
For example: the selected tab, the texts in the text boxes, the array for lists, etc. etc.  
In short: changing the STATE changes the interface accordingly.
So we have very cool features: Automatic Tests, Remote Synchronizations, Time Travel, Microfrontend ...  

```js
import { createStore, useStore } from "@priolo/jon"

const store = createStore({
	state: {
		theTrue: "42",
	}
})

const MyComponent = function () {
	const state = useStore(store)
	return <div>The true is: {state.theTrue}</div>
}
```

### Rules
- The STATE is a JSON so there should be no complex objects (only string or number)  
and ESPECIALLY no reference to external objects!  
- It is IMMUTABLE. That is, if I have a STATE it always displays the same VIEW  




## GETTERS
They are functions that return a value ... typically a property of the STATE being processed.  
A classic example is the concatenation of the first and last name:  

```js
import { createStore } from "@priolo/jon"

const store = createStore({
	state: {
		firstName: "Ivano",
		lastName: "Iorio"
	},
	getters: {
		getName: (_, store) => `${store.state.firstName} ${store.state.lastName}`,
		// or...
		getName: (_, {state}) => `${state.firstName} ${state.lastName}`,
	}
})

console.log( store.getName() )
// Ivano Iorio
```

### Rules
- They are PURE FUNCTIONS and  
can only use the STATE and other GETTERS of the same STORE in addition, of course, to the `payload`
- Always return a value
- However ALL the functions of the STORE have this signature:  
`(payload:any|null, store:Store) => any`  


## ACTIONS
They make something happen!  
The only functions that can access external APIs (for example send/upload data to the BE).  
They call the GETTERS and SETTERS to organize the STORE.  
In short, if you press a button there will be an ACTION to manage that task. 

```js
import { createStore } from "@priolo/jon"

const store = createStore({
	state: {
		firstName: "Ivano",
		lastName: "Iorio"
	},
	actions: {
		print: (pref, {state}) => {
			const output = `${pref} ${state.firstName} ${state.lastName}`
			console.log( output )
		}
	}
})

store.print("Mr.")
// Mr. Ivano Iorio
```

### Rules
- They can be `async` 
- They can call external functions or ACTIONS from another STORE
- These functions also have signature:  
`(payload:any|null, store:Store) => any`


## MUTATORS
The 'mutators' create a new modified STATE   
and replace it with the current STATE (a STATE is immutable!).  
They then notify the COMPONENTs (which use the STORE) to render  

```js
import { createStore } from "@priolo/jon"

const store = createStore({
	state: {
		firstName: "Ivano",
		lastName: "Iorio"
	},
	actions: { ... },
	mutators: {
		setFirstName: firstName => ({firstName}),
		setLastName: lastName => ({lastName})
	}
})

store.setFirstName("Maria")
store.setLastName("Rossi")
store.print("Miss.")
// Miss. Maria Rossi
```

### Rules
- the only functions that can replace one STATE with another STATE   
  (STATEs are by themselves immutable)
- They accept a STATE and possibly a paylod and return the new modified STATE
- This one also has the same signature as the others:  
`(payload:any|null, store:Store) => any`
