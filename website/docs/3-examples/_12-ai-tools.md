---
title: 'AI tools'
sidebar_label: 'AI tools'
sidebar_position: 12
---

# AI tools

A store action is already `name(payload) => result` — which is exactly the shape of an LLM "function declaration". So let the model call your store: `storeToTools` turns actions into tools, and the agent mutates the **same reactive state the UI reads**. Model adds a task → the list on screen updates by itself.

:::info experimental
[`storeToAiTools.ts`](https://github.com/priolo/jon/blob/master/src/lib/experimentals/storeToAiTools.ts) is experimental and not exported from the package yet — copy the file into your project (it's self-contained and SDK-neutral: the shapes work with both Gemini and Anthropic).
:::

```tsx
import { createStore, useStore, Store } from "@priolo/jon"
import { storeToTools } from "./storeToAiTools"

const todoStore = createStore({

  state: {
    tasks: [] as { id: number, text: string, done: boolean }[],
  },

  getters: {
    tasksLeft: (_: void, store: Store) =>
      store.state.tasks.filter(t => !t.done).length,
  },

  actions: {
    addTask: (text: string, store: Store) => {
      const id = Math.max(0, ...store.state.tasks.map(t => t.id)) + 1
      store.setTasks([...store.state.tasks, { id, text, done: false }])
      return `added task ${id}: "${text}"`
    },
    completeTask: (id: number, store: Store) => {
      store.setTasks(store.state.tasks.map(t => t.id == id ? { ...t, done: true } : t))
      return `task ${id} completed`
    },
  },

  mutators: {
    setTasks: (tasks) => ({ tasks }),
  },

})

// store actions become the agent's TOOLS
const { functionDeclarations, dispatchAll } = storeToTools(todoStore, [
  {
    name: "addTask",
    description: "Adds a new task to the todo list",
    parameters: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    map: (args) => args.text, // the action wants the bare string, not { text }
  },
  {
    name: "completeTask",
    description: "Marks the task with the given id as done",
    parameters: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
    map: (args) => args.id,
  },
  {
    name: "tasksLeft",
    description: "Returns how many tasks are left to do",
  },
])

// 1. declare `functionDeclarations` to the model (Gemini / Claude)
// 2. the model answers with function calls
// 3. dispatchAll executes them ON THE SAME STORE the UI uses:
const results = await dispatchAll(modelFunctionCalls)
// → the components subscribed via useStore(todoStore) re-render on their own
```

## What's going on

- `storeToTools` gives you two things: `functionDeclarations` (what you declare to the model in your API call) and `dispatchAll` (executes the model's function calls against the store and collects the results to send back).
- The optional `map` adapts the model's args object to the action's payload — actions take a single payload, models send named args.
- Getters work as read-only tools (`tasksLeft`): the agent can inspect state, not just mutate it.
- The key point: **agent and UI share the state**. There's no sync layer, no "apply the model's answer to the app" step — a tool call *is* a store call, and `useStore` does the rest.

Full source: [src/examples/aiTools](https://github.com/priolo/jon/blob/master/src/examples/aiTools/App.tsx) (runnable with a fake regex-based "model", so no API key needed)
