# I built a React store you *copy-paste* instead of `npm install` — and it doubles as a tool layer for AI agents

*(cross-posting to r/reactjs / r/javascript — would love to get torn apart in the comments)*

So I've been maintaining a tiny state manager called **jon** for a while, and after a recent round of refactoring I think it landed on two ideas that are actually worth sharing — not because it's "better than Zustand" (it isn't trying to be), but because it occupies a corner of the design space I rarely see discussed.

Let me make the case, and please poke holes in it.

---

## TL;DR

- It's ~80 lines of TypeScript on top of `useSyncExternalStore`. No runtime, no magic.
- You can **copy-paste the file into your project** instead of adding a dependency. You own the code.
- Stores are defined with a `state / getters / actions / mutators` setup (Pinia/Vue vibes), and the types are **fully inferred** — no casts, no hand-written interfaces.
- The same store can be exposed as **tools for an LLM agent** with ~30 extra lines. The agent and your UI mutate the *same* reactive state.

---

## 1. It's just React, with a thin shell

The whole thing is built on `useSyncExternalStore`, the official React 18 primitive for external stores. That matters: it's tearing-safe and concurrent-mode-safe out of the box, which a lot of homemade `useState + forceUpdate` stores get subtly wrong.

The hook is basically this:

```ts
export function useStore<T>(store: StoreCore<T>, fn?: ShouldRender<T>): T {
	const subscribe = useCallback(
		(listener) => store._subscribe(listener, fn),
		[store] // keep the subscribe stable across renders
	)
	return useSyncExternalStore(subscribe, () => store.state)
}
```

> Side note that cost me an afternoon: the `useCallback` there is **not** optional. An inline `(listener) => ...` is a new function identity every render, and `useSyncExternalStore` keeps `subscribe` in an effect dependency — so without it React unsubscribes+resubscribes on *every* render. It doesn't cause extra re-renders (the snapshot stays coherent), but it does fire your subscribe/unsubscribe side effects constantly. I literally only believed it after writing a test that counted the ADD/REMOVE events. Lesson: write the test, don't trust your gut.

## 2. You copy-paste it — that's the feature, not a limitation

Here's the pitch that I think is genuinely underrated: **it's not a dependency, it's a snippet you own.**

- No `node_modules` black box, no transitive deps, no supply-chain surface.
- Find a bug or want different behavior? Edit it in place. No waiting on an upstream PR, no fork.
- "Native React + a small utility" is an accurate description, not marketing — the core is a `useSyncExternalStore` wrapper over a `Set` of listeners.

The honest downside: you give up the *update path*. If the core has a bug, every project that pasted it has to patch its own copy — drift is real, and there's no semver. So this trade-off only wins when the core is **small and stable**, which is exactly the case here. I'd frame it as a different category from Zustand, not a competitor.

## 3. The types are inferred — no casts, no boilerplate

This is the part I'm most happy about. You write a plain setup object:

```ts
const setup = {
	state: (): CounterState => ({ count: 0, label: 'init' }),
	getters: {
		double: (_: void, store: Store<CounterState>) => store.state.count * 2,
	},
	actions: {
		incBy: async (amount: number, store: Store<CounterState>) => {
			store.setCount(store.state.count + amount)
			return store.state.count
		},
	},
	mutators: {
		setCount: (count: number) => ({ count }),
		setLabel: (label: string) => ({ label }),
	},
}

export const counterStore = createStore(setup) // <- no `as`, no interface
```

And you get this, inferred:

```ts
counterStore.setCount(5)     // (count: number) => void
counterStore.double()        // () => number
counterStore.incBy(3)        // (amount: number) => Promise<number>
counterStore.state.count     // number

counterStore.setCount('x')   // ❌ string not assignable to number
counterStore.setCount()      // ❌ expected 1 argument
counterStore.nope()          // ❌ property does not exist
```

The trick is a couple of mapped types in `createStore` that **strip the injected `store` parameter** from each method's public signature and unwrap the state factory:

```ts
type PublicFn<F> = F extends (payload: infer P, ...rest: any[]) => infer R
	? ([P] extends [void] ? () => R : (payload: P) => R)
	: never
```

Two honest caveats:
- Sibling calls *inside* an action (`store.setCount(...)`) go through a permissive handle and aren't type-checked. That's the price of not writing a circular `interface MyStore extends ...`. The external surface — i.e. 90% of usage — is fully typed.
- The key gotcha I hit: if your store type has an index signature (`Record<string, any>`), it **eats** your precise method types (`T & any` collapses to `any`). I had to split the bare core (no index signature → precise types) from the permissive handle used inside the setup.

## 4. Bonus: your store *is* your agent's tool layer

This is the bit that made me want to write a post at all. An LLM "tool" is basically `name(payload) => result` plus a JSON schema. A store action is *already* `name(payload) => result`. So the mapping is nearly 1:1:

| LLM function declaration | Store setup |
|---|---|
| `name` | the action key |
| `description` | the doc |
| `parameters` (JSON Schema) | the payload |
| `execute(args)` | the action itself |

With a small helper you advertise the tools and dispatch calls straight onto the store:

```ts
const { functionDeclarations, dispatchAll } = storeToTools(counterStore, [
	{ name: 'incBy', description: 'Increment by amount',
	  parameters: { type: 'object', properties: { amount: { type: 'number' } }, required: ['amount'] },
	  map: a => a.amount },
])

// later, in the chat loop:
const calls = res.response.functionCalls() ?? []
const results = await dispatchAll(calls)  // <- mutates the store...
```

…and because it mutates the store, **`useSyncExternalStore` re-renders your UI**. The actual selling point isn't "store → tools", it's the **reactive loop**:

```
LLM tool call → action/mutator → state change → useStore → UI updates
```

The agent and the user drive the *same* reactive state, indistinguishably. For AI-native React apps that's a really clean architecture, and you don't pull in an SDK for it — the tool shapes are framework-neutral (work with Gemini and Anthropic) and the helper is itself copy-pasteable.

The one thing you can't escape: **TS types are erased at runtime**, so you can't auto-generate the JSON Schema from the payload type. You declare the schema per tool. (You *could* use zod and get schema + validation + types from one source — but that reintroduces a dependency, which fights the whole "zero deps" thing.)

---

## So... why does this exist when Zustand exists?

Fair question, and I want to be straight about it. Zustand is excellent, tiny, and has a mature ecosystem. If you want a battle-tested dependency, use it.

The niche jon fills is: **a reactive store that isn't a dependency but a snippet you own, with an opinionated Pinia-style setup, that happens to be a clean tool surface for AI agents.** That's a different value proposition, not "Zustand but mine".

If you think that niche is imaginary, tell me — that's genuinely the feedback I'm after. And if you've solved the "store → agent tools" loop a nicer way, I'd love to see it.

Repo's in the comments. Roast away. 🔥
