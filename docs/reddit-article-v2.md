# Your React store is already an LLM tool layer — you just haven't declared it yet

*(r/reactjs / r/javascript — happy to be proven wrong in the comments)*

I maintain a tiny state manager called **jon** (~80 lines of TypeScript on top of `useSyncExternalStore`, zero production deps). I'm not here to tell you it beats Zustand — it doesn't try to. I'm here because while refactoring it I stumbled on two ideas that I think are worth discussing on their own, regardless of the library.

## Idea 1: a store action and an LLM tool are the same thing

An LLM "tool" (function declaration) is `name + description + JSON schema + execute(args) => result`.

A store action is *already* `name(payload) => result`.

So the mapping is nearly 1:1, and the bridge is ~30 lines:

```ts
const todoStore = createStore({
  state: { tasks: [] as Task[] },
  actions: {
    addTask: (text: string, store) => {
      const id = Math.max(0, ...store.state.tasks.map(t => t.id)) + 1
      store.setTasks([...store.state.tasks, { id, text, done: false }])
      return `added task ${id}: "${text}"`
    },
    completeTask: (id: number, store) => {
      store.setTasks(store.state.tasks.map(t => t.id == id ? { ...t, done: true } : t))
      return `task ${id} completed`
    },
  },
  mutators: {
    setTasks: (tasks: Task[]) => ({ tasks }),
  },
})

const { functionDeclarations, dispatchAll } = storeToTools(todoStore, [
  {
    name: "addTask",
    description: "Adds a new task to the todo list",
    parameters: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    map: args => args.text,
  },
  {
    name: "completeTask",
    description: "Marks the task with the given id as done",
    parameters: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
    map: args => args.id,
  },
])
```

You hand `functionDeclarations` to the model (the shapes are framework-neutral — Gemini and Anthropic both take them), and when the model answers with function calls you just:

```ts
const results = await dispatchAll(calls)
```

Here's the part that actually matters. `dispatchAll` runs the calls **on the same store your components are subscribed to**, so the loop closes itself:

```
LLM tool call → action → mutator → state change → useSyncExternalStore → UI re-renders
```

The agent and the user drive the *same* reactive state, through the *same* actions. The checkbox in your todo list and the model's `completeTask` call are literally the same code path. No parallel "agent state" to sync, no SDK dependency in the bridge.

The one thing you can't escape: TS types are erased at runtime, so the JSON schema is declared per tool by hand. (Zod would give you schema + types from one source — but that reintroduces a dependency, which fights the next idea.)

## Idea 2: don't install it — copy-paste it

The whole store fits in one self-contained file ([`rvx_juice.ts`](https://github.com/priolo/jon/blob/master/src/lib/store/rvx_juice.ts)) whose only import is `react`. The intended usage is: **paste it into your project and own it.**

- No transitive deps, no supply-chain surface, no `node_modules` black box.
- Want different behavior? Edit it in place. No fork, no upstream PR, no waiting.
- It's honest "native React": `useSyncExternalStore` over a `Set` of listeners — tearing-safe and concurrent-safe because React does that part, not me.

The honest downside: you give up the update path. If the core has a bug, every pasted copy patches itself — drift is real, there's no semver. That trade-off only wins when the core is small and stable enough to be *finished*, which is the bet here. If you want a maintained dependency with an ecosystem, use Zustand — different category, not a competitor.

(There's also an npm package with the full version — plugins/watchers, lifecycle hooks — for when you outgrow the snippet.)

## The API, in 20 seconds

Pinia-flavored setup, fully inferred types — no casts, no hand-written interfaces:

```tsx
const counterStore = createStore({
  state: { count: 0 },
  actions: {
    increment: (_: void, store) => store.setCount(store.state.count + 1),
  },
  mutators: {
    setCount: (count: number) => ({ count }),  // partial state, shallow-merged
  },
})

function Counter() {
  const { count } = useStore(counterStore)
  return <button onClick={() => counterStore.increment()}>{count}</button>
}
```

One deliberate oddity: `useStore(store, fn?)` takes a **re-render predicate**, not a selector. It always returns the full state; `fn(state, oldState) => boolean` decides whether this component re-renders:

```tsx
// re-renders ONLY when `name` changes; incrementing `count` doesn't touch it
const { name } = useStore(userStore, (s, old) => s.name != old.name)
```

Simpler mental model, same render control — and per-row subscriptions in lists work by comparing `items[index]` by reference.

## What I'm asking you

- Is "a store you own instead of install" a real niche, or am I romanticizing what is just vendoring?
- Has anyone closed the "agent and UI mutate the same reactive state" loop a cleaner way? I'd genuinely like to see it.

Repo and runnable examples (counter, async, per-row renders, router in 40 lines, fake-LLM agent demo) in the comments. Roast away. 🔥
