import { createStore, useStore } from "@priolo/jon";

/**
 * Esempio minimale: jon come "router".
 *
 * Tutto sta in questo file:
 * - due utility per fare il match di un path con i parametri (es. "/user/{id}")
 * - uno store con il path corrente
 * - dei semplici <a> che, al click, modificano lo store
 * - la view che reagisce al cambio di path
 */

// --- UTILITY DI MATCHING ----------------------------------------------------

/**
 * Trasforma un pattern tipo "/param/{par1}/test/{par2}" in una RegExp e
 * nell'elenco dei nomi dei parametri trovati.
 * Esempio: "/user/{id}" -> /^\/user\/([^/]+)$/ con names = ["id"]
 */
function compile(pattern: string): { regex: RegExp; names: string[] } {
	const names: string[] = []
	const source = pattern.replace(/\{([^}]+)\}/g, (_, name) => {
		names.push(name)        // memorizzo il nome del parametro
		return "([^/]+)"        // ...e lo sostituisco con un "segmento qualsiasi"
	})
	return { regex: new RegExp(`^${source}$`), names }
}

// --- LO STORE ---------------------------------------------------------------

const routerStore = createStore({
	state: {
		path: window.location.pathname
	},

	getters: {
		/** true se il path corrente combacia con il pattern (anche con parametri) */
		isCurrent: (pattern: string, store) => compile(pattern).regex.test(store.state.path),

		/** i parametri del path corrente secondo il pattern (o null se non combacia) */
		paramsOf: (pattern: string, store) => {
			const { regex, names } = compile(pattern)
			const found = regex.exec(store.state.path)
			if (!found) return null
			// found[0] è l'intera stringa; i gruppi catturati partono da found[1]
			return names.reduce<Record<string, string>>((params, name, i) => {
				params[name] = found[i + 1]
				return params
			}, {})
		}
	},

	actions: {
		/**
		 * Naviga verso un nuovo path:
		 * - aggiorna la URL del browser (senza ricaricare la pagina)
		 * - aggiorna lo stato dello store (che fa ri-renderizzare le view)
		 * @param path il path di destinazione
		 */
		goto: (path: string) => {
			if (routerStore.state.path === path) return;
			window.history.pushState({}, "", path);
			routerStore.setPath(path);
		},
	},
	mutators: {
		// imposta il path corrente
		setPath: (path: string) => ({ path }),
	},
})

// Quando l'utente usa avanti/indietro del browser, riallineiamo lo store.
window.addEventListener("popstate", () => routerStore.setPath(window.location.pathname));

// --- LA PAGINA --------------------------------------------------------------

export default function App() {
	// ci abboniamo allo store: ad ogni cambio di path il componente si ri-renderizza
	const { path } = useStore(routerStore)

	// i parametri estratti dal path corrente (null se la route non combacia)
	const params = routerStore.paramsOf("/param/{par1}/test/{par2}")

	return (
		<div style={{ fontFamily: "sans-serif", padding: 24 }}>
			<h1>jon · esempio di routing</h1>

			<nav style={{ marginBottom: 24, display: "flex", gap: 12 }}>
				{/* un click cambia direttamente lo store */}
				<a href="#" onClick={() => routerStore.goto("/")}>Home</a>
				<a href="#" onClick={() => routerStore.goto("/param/3/test/value")}>About</a>
				<a href="#" onClick={() => routerStore.goto("/contacts")}>Contatti</a>
			</nav>

			{/* la "route": mostro il contenuto in base al path */}
			{routerStore.isCurrent("/") && <p>Benvenuto nella Home.</p>}
			{routerStore.isCurrent("/param/{par1}/test/{par2}") && (
				<div>
					<p>Questa è la pagina About.</p>
					<p>par1 = <code>{params?.par1}</code>, par2 = <code>{params?.par2}</code></p>
				</div>
			)}
			{routerStore.isCurrent("/contacts") && <p>Scrivici a esempio@jon.dev</p>}

			<footer style={{ marginTop: 32, color: "#888" }}>
				path corrente: <code>{path}</code>
			</footer>
		</div>
	)
}
