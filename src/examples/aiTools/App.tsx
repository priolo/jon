import { useState } from "react"
import { FunctionCall, storeToTools } from "../../lib/experimentals/storeToAiTools"
import { createStore, Store, useStore } from "../../lib/store/rvx_juice"



interface Task {
  id: number
  text: string
  done: boolean
}

const todoStore = createStore({

  state: {
    tasks: [
      { id: 1, text: "buy the milk", done: false },
      { id: 2, text: "write the docs", done: false },
    ] as Task[],
  },

  getters: {
    tasksLeft: (_: void, store: Store) =>
      store.state.tasks.filter((t: Task) => !t.done).length,
  },

  actions: {
    addTask: (text: string, store: Store) => {
      const id = Math.max(0, ...store.state.tasks.map((t: Task) => t.id)) + 1
      store.setTasks([...store.state.tasks, { id, text, done: false }])
      return `added task ${id}: "${text}"`
    },
    completeTask: (id: number, store: Store) => {
      store.setTasks(store.state.tasks.map((t: Task) => t.id == id ? { ...t, done: true } : t))
      return `task ${id} completed`
    },
  },

  mutators: {
    setTasks: (tasks: Task[]) => ({ tasks }),
  },

})

/**
 * The point of this example: the store actions become the TOOLS of an LLM agent.
 * `functionDeclarations` is what gets declared to the model (Gemini/Anthropic),
 * `dispatchAll` executes the model's functionCalls ON the same store the UI uses.
 */
const { functionDeclarations, dispatchAll } = storeToTools(todoStore, [
  {
    name: "addTask",
    description: "Adds a new task to the to-do list",
    parameters: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    map: (args) => args.text, // the action wants the bare string, not { text }
  },
  {
    name: "completeTask",
    description: "Marks the task with the given id as completed",
    parameters: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
    map: (args) => args.id,
  },
  {
    name: "tasksLeft",
    description: "Returns how many tasks are left to complete",
  },
])

/**
 * Fake LLM: turns the prompt into functionCalls with two regexes.
 * In production this is replaced by a call to Gemini/Claude with
 * `functionDeclarations` (see the comment at the bottom of storeToAiTools.ts):
 * everything else in the example stays identical.
 */
function fakeModel(prompt: string): FunctionCall[] {
  const calls: FunctionCall[] = []
  const add = prompt.match(/add (.+)/i)
  if (add) calls.push({ name: "addTask", args: { text: add[1] } })
  const complete = prompt.match(/complete (?:task )?(\d+)/i)
  if (complete) calls.push({ name: "completeTask", args: { id: Number(complete[1]) } })
  if (/how many/i.test(prompt)) calls.push({ name: "tasksLeft" })
  return calls
}

export default function App() {

  const { tasks } = useStore(todoStore)
  const [prompt, setPrompt] = useState("add wash the dishes")
  const [log, setLog] = useState<string[]>([])

  async function send() {
    const calls = fakeModel(prompt)
    if (calls.length == 0) {
      setLog(l => [...l, `» ${prompt}`, `  (no tool recognized: try "add ...", "complete 1", "how many are left?")`])
      return
    }
    // the model's functionCalls mutate the store: the list above updates by itself
    const results = await dispatchAll(calls)
    setLog(l => [...l,
      `» ${prompt}`,
      ...results.map(r => `  ${r.functionResponse.name} → ${JSON.stringify(r.functionResponse.response.result)}`),
    ])
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>jon · the store as an agent's tool layer</h1>

      <ul>
        {tasks.map((t: Task) => (
          <li key={t.id} style={{ textDecoration: t.done ? "line-through" : undefined }}>
            {/* the UI uses the SAME actions the agent uses */}
            <label>
              <input type="checkbox" checked={t.done} disabled={t.done}
                onChange={() => todoStore.completeTask(t.id)} />
              {t.id} · {t.text}
            </label>
          </li>
        ))}
      </ul>
      <p>to do: <code>{todoStore.tasksLeft()}</code></p>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={prompt} onChange={e => setPrompt(e.target.value)} style={{ flex: 1 }} />
        <button onClick={send}>send to the agent</button>
      </div>

      <pre style={{ background: "#f5f5f5", padding: 8, minHeight: 60 }}>{log.join("\n")}</pre>

      <details>
        <summary>functionDeclarations declared to the model</summary>
        <pre>{JSON.stringify(functionDeclarations, null, 2)}</pre>
      </details>
    </div>
  );
}
