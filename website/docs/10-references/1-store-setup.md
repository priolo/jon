---
id: "store-setup"
title: 'StoreSetup'
sidebar_label: 'StoreSetup'
sidebar_position: 1
---


It is a generic js object used to build the Store  
It could be thought of as a configuration  
Its declaration is:

```ts
const setup = {
	state: any|()=>any),
	getters: { [name: string]: CallStoreSetup },
	actions: { [name: string]: CallStoreSetup },
	mutators: { [name: string]: CallStoreSetup }
}

const store1 = createStore(setup)
const store2 = createStore(setup)
```


## state
`any|()=>any`  
Initialises the state of the STORE.  
If it is a `function` this is executed when the STORE is created.   
Then the returned value is assigned to the `state` of the STORE.   

```js
{
	state: () => {
		...
		return value
	},
	...
}
```

#### Rules
- The STATE is a JSON so there should be no complex objects (only string or number)  
and ESPECIALLY no reference to external objects!  
- It is IMMUTABLE. That is, if I have a STATE it always displays the same VIEW  


## getters
`{ [name: string]: CallStoreSetup }`  
A `dictionary`. It groups functions that allow a value to be taken from the STORE

```js
{
	getters: {
		getValue1: (_, {state}) => state.value1,
		getValue2: (param1, {state}) => state.value2 + param1,
		...
	},
	...
}
```

#### Rules
- They are PURE FUNCTIONS and  
can only use the STATE and other GETTERS of the same STORE in addition, of course, to the `payload`
- Always return a value



## actions
`{ [name: string]: CallStoreSetup }`  
A `dictionary`. It groups functions which perform an atomic action.
This can call external resources

#### Rules
- They can be `async` 
- They can call external functions or ACTIONS from another STORE

## mutators
`{ [name: string]: CallStoreSetup }`  
A `dictionary`. It groups functions that change state resulting in an interface update (VIEW)

#### Rules
- the only functions that can replace one STATE with another STATE   
  (STATEs are by themselves immutable)
- They accept a payload and the store, and return a partial state object to be merged