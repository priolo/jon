# CLAUDE.md

Guidance for working in this repository.

## What this is

`@priolo/jon` ("jon") is a **minimalist React state-management library** — ~80 lines of TypeScript on top of React's `useSyncExternalStore`. No runtime, no magic, zero production dependencies (React is a peer dependency).

Two ideas define the project (see [docs/reddit-article.md](docs/reddit-article.md) for the full pitch):

1. **It can be copy-pasted instead of installed.** The core is small and stable enough that you can paste a single self-contained file into your own project and own the code, with no dependency / supply-chain surface. See "The juice file" below.
2. **A store doubles as an LLM agent's tool layer.** A store action is already `name(payload) => result`, which maps almost 1:1 onto a model "function declaration". The agent and the UI then mutate the *same* reactive state. See [src/lib/experimentals/storeToAiTools.ts](src/lib/experimentals/storeToAiTools.ts).

The store API is Pinia/Vuex-flavored (`state / getters / actions / mutators`) and **fully type-inferred** — no casts, no hand-written interfaces.

## Core model

A store is defined by a **setup object** passed to `createStore`:

- **`state`** — the initial state object, or a `() => state` factory. A plain object is deep-cloned (`structuredClone`); a factory is called as-is.
- **`mutators`** — the *only* things that replace state. Synchronous. Return a **partial** state object that gets shallow-merged; return `undefined` to skip the update. Signature `(payload, store) => Partial<State> | void`. An update whose returned values already equal the current state is skipped (no re-render, no plugin event).
- **`actions`** — sync or async; for side effects, API calls, and orchestration. They don't return partial state — they call mutators. Signature `(payload, store) => any | Promise<any>`.
- **`getters`** — computed/derived values. Signature `(payload, store) => any`.
- **`onListenerChange` / `onStateChange`** — optional lifecycle hooks.

Every setup function receives the **`store` handle as its second argument** — treat it like `this`: call sibling mutators/actions/getters via `store.setX(...)` and read `store.state`. (`store` here is the permissive `Store` handle with an index signature, so sibling calls are *not* type-checked — that's the deliberate price of avoiding circular interfaces.)

In React, `useStore(store)` subscribes a component and returns the current state. Pass an optional predicate `(state, oldState) => boolean` to re-render only when it returns `true`.

The reactive loop, end to end:

```
mutator (or LLM tool call) → state change → useSyncExternalStore → component re-renders
```

Methods are called directly on the store instance, passing **only the payload**: `myStore.setValue("x")`, `myStore.doubleCount()`. The injected `store` param is stripped from the public signature.

## Repository layout

The library lives in `src/lib/`:

- [src/lib/store/rvx.ts](src/lib/store/rvx.ts) — **the canonical implementation** of `createStore` + `useStore`. Edit core logic here.
- [src/lib/store/global.ts](src/lib/store/global.ts) — all shared types (`StoreSetup`, `StoreCore`, `Store`, `StoreOf`) and the type-inference machinery (`PublicFn`, `PublicMut`, `Methods`, `StateOf`) that derives the typed store from the setup literal.
- [src/lib/store/rvxPlugin.ts](src/lib/store/rvxPlugin.ts) — the watcher/plugin system: `addWatch`, `removeWatch`, `pluginEmit`, `EVENTS_TYPES`. Used to observe actions/mutators (e.g. bind two stores).
- [src/lib/store/mixStores.ts](src/lib/store/mixStores.ts) — `mixStores(...setups)`: merges multiple setup objects so a store can be split across files.
- [src/lib/store/utils.ts](src/lib/store/utils.ts) — render helpers: `renderOnChange`, `equalsSome`, `equalsIgnore`.
- [src/lib/input/validator.ts](src/lib/input/validator.ts) — a small form-validation system (`useValidator`, `validateAll`, `resetAll`), independent of the store core.
- [src/index.ts](src/index.ts) — the **public API surface**. This is the source of truth for what's exported; keep it in sync when adding/removing public symbols.
- `src/lib/experimentals/` — not yet part of the public API. `storeToAiTools.ts` (the LLM tool bridge) lives here.

Tests are in `src/tests/` (one file per concern: actions, getters, mutators, selectors, watchers, plugins, multi-component, tools, validator). Docs live in `website/` (Docusaurus) and `docs/`.

## The juice file — keep it self-contained

[src/lib/store/rvx_juice.ts](src/lib/store/rvx_juice.ts) is the **copy-paste edition** of the library. Its entire purpose is that a user can copy this one file into their project and have a working store with **no imports from the rest of the library and no dependencies** (other than `react`).

**Critical constraint:** `rvx_juice.ts` must stay completely standalone and decoupled from the real library ([src/lib/store/rvx.ts](src/lib/store/rvx.ts) and [global.ts](src/lib/store/global.ts)). It deliberately re-declares its own copies of the types and `createStore`/`useStore` inline. When changing the core:

- **Never** make `rvx_juice.ts` import from `rvx.ts`, `global.ts`, or anything else in the library. Its only allowed import is from `react`.
- If you change core behavior in `rvx.ts`, port the equivalent change into `rvx_juice.ts` by hand to keep them in sync — but as a copy, not a reference.
- The juice file is intentionally a leaner subset: it omits the plugin/watcher hooks (`pluginEmit`, lifecycle events) that the full `rvx.ts` wires in. Don't "fix" that by importing the plugin — that would defeat the purpose.

The companion `src/lib/experimentals/storeToAiTools.ts` imports `Store` *from `rvx_juice`* on purpose, and likewise carries no SDK dependency — the tool/function-declaration shapes are framework-neutral (work with Gemini and Anthropic) so it too stays copy-paste friendly.

## Commands

- **Test:** `npm test` (Vitest). Tests use `@testing-library/react` + jsdom.
- **Build:** `npm run build` (Vite → ES + UMD bundles into `dist/`, with `.d.ts` via `vite-plugin-dts`).
- **Watch build:** `npm run build:watch`.
- **Publish:** `npm run pub` (runs `build` via `prepublishOnly`, then `npm publish --access public`).

## Conventions

- The core is **TypeScript**; tests are `.jsx`. Prefer TS for new core logic.
- Mutators are synchronous and return state diffs; actions handle async and orchestration. Don't put async logic in mutators.
- State updates are **shallow merges** — a mutator returning `{ a }` only replaces `a`.
- The type system infers the public store from the setup *literal*, so `createStore` must stay generic over `S extends StoreSetup`. Avoid annotating the setup with an explicit interface that has an index signature — `T & Record<string, any>` collapses precise method types to `any`.

## Note on docs

The `website/` Docusaurus docs have been rewritten to match the current API: the old drift (`useStoreNext`, a `rules` export, a `selector`-style `useStore`) is gone — `useStore` is documented as taking a re-render *predicate* `(state, oldState) => boolean`, not a selector. A couple of historical `useStoreNext`/`MultiStoreProvider` mentions survive only as comments inside test files (`src/tests/store_selector.test.tsx`, `store_plugin.test.tsx`) and are harmless.

Still, treat [src/index.ts](src/index.ts) and the source as the source of truth if anything diverges. When annotating a variable that holds `createStore(...)`'s result, prefer `StoreOf<typeof setup>` over `: Store` — `Store` is the permissive handle (`Record<string, any>`) and collapses the inferred method/state types to `any`, defeating the type inference. Annotating the *setup function's* `store` param as `store: Store` is correct, though (that param is the permissive handle by design).
