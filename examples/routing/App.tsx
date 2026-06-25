import { createStore, useStore } from "@priolo/jon";

/**
 * Confronta `path` con un `pattern` tipo "/user/{id}".
 * Restituisce i parametri estratti ({ id: "42" }) oppure `null` se non combacia.
 * Essendo `null` "falsy", il risultato serve anche come test di match.
 */
function matchPath(pattern: string, path: string): Record<string, string> | null {
	const names: string[] = []
	const source = pattern.replace(/\{([^}]+)\}/g, (_, name) => (names.push(name), "([^/]+)"))
	const found = new RegExp(`^${source}$`).exec(path)
	return found ? Object.fromEntries(names.map((name, i) => [name, found[i + 1]])) : null
}

const routerStore = createStore({
	state: { path: window.location.pathname },

	getters: {
		/** parametri del path corrente secondo il pattern, o null se non combacia */
		match: (pattern: string) => matchPath(pattern, routerStore.state.path),
	},
	actions: {
		/** naviga: aggiorna la URL del browser e lo stato (senza ricaricare) */
		goto: (path: string) => {
			window.history.pushState({}, "", path)
			routerStore.setPath(path)
		},
	},
	mutators: {
		setPath: (path: string) => ({ path }),
	},
})

// avanti/indietro del browser: riallinea lo store alla URL corrente
window.addEventListener("popstate", () => routerStore.setPath(window.location.pathname))

export default function App() {
	// abbonamento allo store: ad ogni cambio di path il componente si ri-renderizza
	useStore(routerStore)

	const about = routerStore.match("/param/{par1}/test/{par2}")

	return (
		<div style={{ fontFamily: "sans-serif", padding: 24 }}>
			<h1>jon · esempio di routing</h1>

			<nav style={{ marginBottom: 24, display: "flex", gap: 12 }}>
				<a href="#" onClick={() => routerStore.goto("/")}>Home</a>
				<a href="#" onClick={() => routerStore.goto("/param/3/test/value")}>About</a>
				<a href="#" onClick={() => routerStore.goto("/contacts")}>Contatti</a>
			</nav>

			{routerStore.match("/") && <p>Benvenuto nella Home.</p>}
			{about && <p>Pagina About · par1 = <code>{about.par1}</code>, par2 = <code>{about.par2}</code></p>}
			{routerStore.match("/contacts") && <p>Scrivici a esempio@jon.dev</p>}

			<footer style={{ marginTop: 32, color: "#888" }}>
				path corrente: <code>{routerStore.state.path}</code>
			</footer>
		</div>
	)
}
