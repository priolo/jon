import { Store } from './rvx_juice'

/**
 * Turn a JON store into a set of tools an LLM agent can call.
 *
 * A store action is already `name(payload) => result`, which maps almost 1:1
 * onto a model "function declaration". The only thing the runtime can't infer
 * (TS types are erased) is the JSON Schema of the payload, so each tool
 * declares its own `parameters`.
 *
 * The shapes below are framework-neutral but match what Google Gemini
 * (`@google/generative-ai`) and Anthropic expect, so the output can be passed
 * straight to either SDK. There is no SDK import here on purpose — this file
 * stays copy-paste friendly and dependency-free.
 */

/** Minimal JSON-Schema subset accepted as a tool's parameters. */
export interface JsonSchema {
	type: 'object'
	properties?: Record<string, unknown>
	required?: string[]
	description?: string
}

/** Describes one tool exposed to the model and how it maps to the store. */
export interface ToolSpec {
	/** tool name shown to the model; also the store method to call, unless `method` is set */
	name: string
	description: string
	/** JSON Schema of the arguments the model must produce */
	parameters?: JsonSchema
	/** store method to invoke (defaults to `name`) */
	method?: string
	/** adapt the model's args object into the store method's payload (e.g. extract a primitive) */
	map?: (args: Record<string, any>) => any
}

/** Gemini/Anthropic-compatible function declaration. */
export interface FunctionDeclaration {
	name: string
	description: string
	parameters?: JsonSchema
}

/** A tool invocation requested by the model. */
export interface FunctionCall {
	name: string
	args?: Record<string, any>
}

/** Gemini-shaped tool result, ready to be sent back to the model. */
export interface FunctionResponsePart {
	functionResponse: { name: string; response: { result: any } }
}

/**
 * Builds the function declarations to advertise to the model and a `dispatch`
 * that executes a model `functionCall` against the store (mutating its state,
 * which in turn re-renders any `useStore` subscriber).
 */
export function storeToTools<T>(store: Store<T>, specs: ToolSpec[]) {

	const functionDeclarations: FunctionDeclaration[] = specs.map((s) => ({
		name: s.name,
		description: s.description,
		...(s.parameters ? { parameters: s.parameters } : {}),
	}))

	const byName = new Map(specs.map((s) => [s.name, s]))

	/** execute a single tool call and return the result wrapped for the model */
	async function dispatch(call: FunctionCall): Promise<FunctionResponsePart> {
		const spec = byName.get(call.name)
		if (!spec) throw new Error(`Unknown tool: "${call.name}"`)

		const methodName = spec.method ?? spec.name
		const method = store[methodName]
		if (typeof method !== 'function') throw new Error(`Store has no method "${methodName}"`)

		const args = call.args ?? {}
		const payload = spec.map ? spec.map(args) : args
		const result = await method(payload)

		return { functionResponse: { name: call.name, response: { result } } }
	}

	/** execute every tool call the model returned in one turn */
	function dispatchAll(calls: FunctionCall[]): Promise<FunctionResponsePart[]> {
		return Promise.all(calls.map(dispatch))
	}

	return { functionDeclarations, dispatch, dispatchAll }
}

/*
 * Usage with @google/generative-ai:
 *
 *   const { functionDeclarations, dispatchAll } = storeToTools(agentStore, [
 *     {
 *       name: 'setCount',
 *       description: 'Set the counter to an absolute value',
 *       parameters: { type: 'object', properties: { count: { type: 'number' } }, required: ['count'] },
 *       map: (a) => a.count,           // mutator expects a bare number, not { count }
 *     },
 *   ])
 *
 *   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', tools: [{ functionDeclarations }] })
 *   const chat  = model.startChat()
 *   let res = await chat.sendMessage(userPrompt)
 *   const calls = res.response.functionCalls() ?? []
 *   if (calls.length) {
 *     const toolResults = await dispatchAll(calls)   // <- mutates the store, UI re-renders
 *     res = await chat.sendMessage(toolResults)      // send results back to the model
 *   }
 */
