---
title: 'Import'
sidebar_label: 'Import'
sidebar_position: 2
---

# Import the library

Copy-pasting [`rvx_juice.ts`](https://github.com/priolo/jon/blob/master/src/lib/store/rvx_juice.ts) is the minimalist path. But you can also install Jon as a regular package:

```bash
npm install @priolo/jon
```

```tsx
import { createStore, useStore } from "@priolo/jon"
```

The core API is identical to the juice file. So why install? Because the full library ships a few **optional extras** that the juice file deliberately leaves out to stay tiny.

## What you get on top

### `addWatch` — observe a store from outside

Watch actions/mutators of a store and react to them — the classic use case is linking two stores without coupling them:

```ts
import { addWatch } from "@priolo/jon"

// when authStore runs "logout", clear the cart.
// Neither store knows the other exists.
addWatch({
  store: authStore,
  actionName: "logout",
  callback: () => cartStore.clear(),
})
```

See it in action: [watch stores](/docs/examples/watch-stores).

The full `createStore` also wires in lifecycle hooks like `onStateChange` (used for [persistence](/docs/examples/persist)) — those events are what the watcher system is built on, and they're not in the juice file.

### `useValidator` — form validation

A small declarative validation system, independent from the store core:

```tsx
import { useValidator, validateAll, resetAll } from "@priolo/jon"

const nameRules = {
  required: (v: string) => !v ? "name is required" : null,
  min: (v: string) => v.length < 3 ? "at least 3 characters" : null,
}

const nameValidator = useValidator(name, nameRules)
// → { helperText, error, inputRef } — spread-ready for a MUI TextField

const errors = validateAll() // validates every field, focuses the first invalid one
```

See it in action: [validator form](/docs/examples/validator-form).

### `mixStores` — compose setups like classes

Merge multiple setup objects into one, ready for `createStore`. Split a big store across files, or write a generic base setup and *extend* it with the real properties — inheritance for stores:

```ts
import { mixStores } from "@priolo/jon"

const store = createStore(mixStores(baseSetup, userSetup, cartSetup))
```

`state`, `getters`, `actions`, `mutators` and the lifecycle hooks are merged together; on conflicts the last setup wins, like a subclass override.

See it in action: [mix stores](/docs/examples/mix-stores).

### `storeToTools` — your store as an LLM tool layer *(experimental)*

A store action is already `name(payload) => result` — which maps almost 1:1 onto an LLM "function declaration". [`storeToAiTools.ts`](https://github.com/priolo/jon/blob/master/src/lib/experimentals/storeToAiTools.ts) turns store actions into tools the model can call, mutating the **same reactive state** the UI reads:

```ts
const { functionDeclarations, dispatchAll } = storeToTools(todoStore, [
  { name: "addTask", description: "Adds a task", parameters: {...} },
])
// declare functionDeclarations to Gemini/Claude,
// then dispatchAll(model function calls) → the UI updates by itself
```

It's still experimental (not exported from the package yet — copy the file, it's also self-contained). See it in action: [AI tools](/docs/examples/ai-tools).

## Rule of thumb

| You need | Do this |
|---|---|
| state / getters / actions / mutators, render predicates | copy `rvx_juice.ts` |
| watchers, lifecycle hooks, validator, `mixStores` | `npm install @priolo/jon` |
