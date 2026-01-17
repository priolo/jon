# GitHub Copilot Instructions for `@priolo/jon`

This repository contains the source code for `@priolo/jon`, a lightweight React state management library using `useSyncExternalStore`.

## Architecture & Core Concepts

The library implements the **STORE** pattern, centering around **Stores** defined by a setup object **StoreSetup**.

### Store Structure (`StoreSetup`)
A store is defined by a setup object containing:
- **`state`**: The initial state object or a function returning it.
- **`mutators`**: Synchronous functions that modify state.
  - **Convention**: Must return a *partial* state object to update. If `undefined` is returned, no update occurs.
  - **Signature**: `(payload, store) => Partial<State> | void`
- **`actions`**: Synchronous or asynchronous functions for side effects or complex logic.
  - **Signature**: `(payload, store) => Promise<any>`
- **`getters`**: Computed properties or selectors.
  - **Signature**: `(payload, store) => any`

### Example Store Setup
```ts
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
		setValue: (value /*, store*/) => ({value})
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
```


### Key Files
- **`src/lib/store/rvx.ts`**: The core implementation of `createStore` and `useStore`.
- **`src/lib/store/mixStores.ts`**: Utility to compose multiple store setups (`mixStores`).
- **`src/index.ts`**: Public API exports.

## Developer Workflows

- **Build**: `npm run build` (uses Vite to bundle for ES and UMD).
- **Test**: `npm test` (uses **Vitest**).
- **Watch**: `npm run build:watch` for development.

## Patterns & Conventions

### Creating a Store
Use `createStore` with a setup object.

```typescript
import { createStore } from '@priolo/jon';

const myStore = createStore({
  state: { count: 0 },
  mutators: {
    increment: (amount, store) => ({ count: store.state.count + amount }), // Returns partial state
  },
  actions: {
    asyncIncrement: async (amount, store) => {
      await someAsyncCall();
      store.increment(amount); // Call mutator
    }
  },
  getters: {
    doubleCount: (_, store) => store.state.count * 2
  }
});
```

### Using a Store in React
Use the `useStore` hook.

```typescript
import { useStore } from '@priolo/jon';

function Counter() {
  // Subscribes to the store
  const state = useStore(myStore); 
  
  // Access mutators/actions directly on the store instance
  return <button onClick={() => myStore.increment(1)}>{state.count}</button>;
}
```

### Store Composition
Use `mixStores` to combine capabilities.

```typescript
import { mixStores } from '@priolo/jon';
const combinedSetup = mixStores(authSetup, themeSetup);
```

## Testing
- Tests are located in `src/tests/`.
- Use `@testing-library/react` for component integration tests.
- Use `vitest` for unit tests.
- Example: `src/tests/store.test.jsx`.

## Important Notes
- **Mutators vs Actions**: Mutators are *synchronous* and *pure-ish* (they return state diffs). Actions are for *async* logic and orchestration.
- **State Updates**: State updates are shallow merges triggered by mutators returning an object.
- **TypeScript**: The core is TypeScript (`.ts`), but the project supports JS. Prefer TypeScript for new core logic.
