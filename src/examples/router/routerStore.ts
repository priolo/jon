import { createStore, Store } from "../../lib/store/rvx_juice"

/**
 * Matches `path` against a `pattern` like "/user/{id}".
 * Returns the extracted parameters ({ id: "42" }) or `null` if it doesn't match.
 * Since `null` is falsy, the result doubles as a match test.
 */
function matchPath(pattern: string, path: string): Record<string, string> | null {
	const names: string[] = []
	const source = pattern.replace(/\{([^}]+)\}/g, (_, name) => (names.push(name), "([^/]+)"))
	const found = new RegExp(`^${source}$`).exec(path)
	return found ? Object.fromEntries(names.map((name, i) => [name, found[i + 1]])) : null
}

const routerStore = createStore({

	state: {
		path: window.location.pathname,
	},

	getters: {
		/** parameters of the current path according to the pattern, or null if it doesn't match */
		match: (pattern: string, store: Store) => matchPath(pattern, store.state.path),
	},

	actions: {
		/** navigate: updates the browser URL and the state (without reloading) */
		goto: (path: string, store: Store) => {
			window.history.pushState({}, "", path)
			store.setPath(path)
		},
	},

	mutators: {
		setPath: (path: string) => ({ path }),
	},
})

// browser back/forward: re-aligns the store with the current URL
window.addEventListener("popstate", () => routerStore.setPath(window.location.pathname))

export default routerStore
