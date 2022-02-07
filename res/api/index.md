
# API

- [MultiStoreProvider](#multistoreprovider)
- [getStore( storeName:string ):store](#getstore-storenamestring-store)
- [useStore( storeName:string ):store](#usestore-storenamestring-store)
- [STORE SETUP JSON](#store-setup-json)
	- [state](#state)
	- [getters](#getters)
	- [mutators](#mutators)
	- [actions](#actions)
	- [_syncAct](#_syncact)
	- [init](#init)
- [mixStores](#mixstores)

## MultiStoreProvider

REACT PROVIDER that contains all REDUCERS  

```jsx
import { MultiStoreProvider } from '@priolo/jon';

const rootElement = document.getElementById("app");
ReactDOM.render(
  <MultiStoreProvider setups={{ layout, user }}>
    <Main />
  </MultiStoreProvider>,
  rootElement
);
```
[code](https://codesandbox.io/s/example-4-0jeqi?file=/index.js:305-351)

| name | desc | default |
|---|---|---|
| setups | A "dictionary" that contains all the STORES to manage | obligatory |
| index | Indice dell'istanza. | optional |

---

## getStore
`getStore ( storeName:string ): store`

Returns a STORE by its name  
It is useful for using a STORE outside a REACT COMPONENT  

```jsx
import { getStore } from "@priolo/jon"

export default {
	...
	actions: {
		fetchAll: async (state, payload, store)=> {
			const { setBusy } = getStore("layout")
			setBusy(true)
			// loading ...			
			setBusy(false)
		},
	},
}
```
[code](https://codesandbox.io/s/example-4-0jeqi?file=/stores/user.js:159-197)

In this example I load, inside an ACTION, the ACTION of another STORE

---

## useStore
`useStore( storeName:string ): store`

Use a STORE by its name. It is useful for using a STORE in a REACT COMPONENT  

```jsx
import {useStore} from "@priolo/jon"

export default function MyComponent() {
	const {state: layout, setTitle} = useStore("layout")
	const {state: user, fetchAll} = useStore("user")

	useEffect(() => {
		setTitle("Users")
		// fetch data
		fetchAll()
	}, [])

	return layout.busy ? (
		<CircularProgress />
	) : (
		<List>
			{user.all.map(user => (
				<ListItem key={user.id}>
					<ListItemText primary={user.name} />
				</ListItem>
			))}
		</List>
	)
}
```
[code](https://codesandbox.io/s/example-4-0jeqi?file=/components/Body.jsx:191-233)

---

## STORE SETUP JSON

An object that will be passed to the PROVIDER then it will be instantiated inside it as a STORE
This STORE is accessible through its name and the global functions `getStore` and `useStore`

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

### state

*The initial STATE of the STORE. "Single Source of Truth"*  
The STATE is connected to the VIEW (via React):  
When the STATE changes then the VIEW updates automatically.
  
To access the STATE of a STORE:

```js
const { state } = useStore("MyStore")
```

Avoid conflicts:
```js
const { state:mystore1 } = useStore("MyStore1")
const { state:mystore2 } = useStore("MyStore2")
```

Outside the "React Hooks":
```js
const { state:mystore } = getStore("MyStore")
```

Then:
```html
<div>{mystore.value}</div>
```

---

### getters

*Returns a value of the STATE.*  
Although you can access the STATE directly  
in many cases you will want some processed data.   

For example: a filtered list:  

```js
const myStore = {
   state: { 
	   users:[...] 
	   }, 
   getters: {
      getUsers: ( state, payload, store ) 
         => state.users.filter(user=>user.name.includes(payload)),
   }
}
```

```jsx
function MyComponent() {
   const { getUsers } = useStore("myStore")
   return getUsers("pi").map ( user => <div>{user.name}</div>)
}
```

The signature of a **getter** is:  
`(state:JSON, payload:any|null, store:Store) => any`
- **state**: the current value of the STATE
- **payload**: (optional) the parameter passed to the getter when it is called
- **store**: the STORE object itself. You can use it as if it were "this"

> GETTERS should ONLY "contain" STATE and GETTERS

---

### mutators

*The only way to change the STATE.*  
It accepts a parameter and returns the "part" of STORE to be modified.

For example:

```js
const myStore = {
   state: { 
	   value1: 10,
	   value2: "topolino",
	}, 
   mutators: {
      setValue1: ( state, value1, store ) => ({ value1 }),
	  // ! verbose !
	  setValue2: ( state, value, store ) => { 
		  const newValue = value.toUpperCase()
		  return {
			  value2: newValue
		  }
	  },
   }
}
```

```jsx
function MyComponent() {
    const { state, setValue1 } = useStore("myStore")
    return <button onClick={e=>setValue1(state.value1+1)}>
        value1: {state.value1}
    </button>
}
```

the signature of a **mutator** is:  
`(state:JSON, payload:any|null, store:Store) => any`  
- **state**: the current value of the STATE
- **payload**: (optional) the parameter passed to the mutator when it is called
- **store**: the STORE object itself. You can use it as if it were "this"

> Inside MUTATORS you should use ONLY the STATE.

---

### actions

*Contains the business logic*  
ACTIONS can be connected to SERVICEs and APIs  
They can call STATE values, MUTATORS and GETTERS  
They can be connected to other STOREs  
They can be async  

A typical use:

```js
const myStore = {
    state: { 
	    value: null,
	}, 
    actions: {
        fetch: async ( state, _, store ) => {
            const { data } = await fetch ( "http://myapi.com" )
            store.setValue ( data )
        }
    },
    mutators: {
        setValue: ( state, value, store ) => ({ value }),
    }
}
```

```jsx
function MyComponent() {
    const { state, fetch } = useStore("myStore")
    return <button onClick={e=>fetch()}>
        value1: {state.value}
    </button>
}
```

the signature of a **action** is:  
`(state:JSON, payload:any|null, store:Store) => any`  
- **state**: the current value of the STATE
- **payload**: (optional) the parameter passed to the action when it is called
- **store**: the STORE object itself. You can use it as if it were "this"

---


As you may have noticed: the functions always have the same signature:  
`(state:JSON, payload:any|null, store:Store) => any` 
parameters:  
- **state**:  
  is the current STATE of the STORE (read only)
- **payload**:  
  any parameter passed to the function (optional)
- **store**:  
  it's the same STORE where the function is (a kind of *this*)

---

### _syncAct
`(action:function, payload:any|null) => void` 

multiple call to action problem:  
If the actions use the same variables  
may not update the STATE correctly ([look here](https://it.reactjs.org/docs/hooks-reference.html#functional-updates))  
In this case use the `_syncAct` function  

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
			store._syncAct(store.update, 1)
		},
		// WORK 3 TIME: value = 3
		work3: async (state, value, store ) => {
			store.update(1)
			await store._syncAct(store.update, 1)
			await store._syncAct(store.update, 1)
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
[codesandbox](https://codesandbox.io/s/example-sync-1-fm05e?file=/src/App.js)

---

### init

It allows you to execute code as soon as the STORE has been instantiated

`(store:Store) => void` 
- `store` the same STORE that contains the init


```jsx
const myStore = {
	state: {
		value: "default value"
	},
	init: (store) => {
		store.setValue("value AFTER INIT")
	},
	mutators: {
		setValue: (state, value) => ({value})
	}
}
```
[codesandbox](https://codesandbox.io/s/example-init-fyrii?file=/src/index.js)

`myStore` as soon as it has been instantiated sets` value` with the value "value AFTER INIT"

---

### watch

Executed when `mutators` and` actions` of a specific STORE are called.

`(store:Store, payload:any|null) => void` 
- `store` the same STORE that contains the "watch"
- `payload` (optional) the "payload" value changed

```jsx
const layout = {
	state: {
		page: "main"
	},
	mutators: {
		setPage: (state, page) => ({page})
	}
}

const log = {
	state: {
		log: "..."
	},
	mutators: {
		setLog: (state, log) => ({log})
	},
	watch: {
		"Layout": {
			"setPage": (store, value) => store.setLog(`set page: ${value}`)
		}
	}
}
```
[codesandbox](https://codesandbox.io/s/example-watch-n8jj2?file=/src/index.js:191-484)

In this example when the STORE-layout calls its `setPage` mutator
the STORE-log function in `watch` will also be called

---

## mixStores

It allows you to combine two STORE-SETUPs.  
Useful for splitting a STORE over several files or for deriving a STORE from a STORE-BASE

[codesandbox](https://codesandbox.io/s/example-mixstores-zopru?file=/src/index.js:445-496)