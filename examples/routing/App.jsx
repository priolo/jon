import React from "react"
import { useStore } from "@priolo/jon"
import routerStore from "./routerStore"
import { Link, Route } from "./components"

/**
 * Esempio d'uso: jon come unico "router".
 *
 * Non serve nessuna libreria di routing: lo stato `path` vive nello store,
 * i componenti <Link> lo modificano e i componenti <Route> reagiscono.
 */
export default function App() {
	return (
		<div style={{ fontFamily: "sans-serif", padding: 24 }}>
			<h1>jon · esempio di routing</h1>

			<nav style={{ marginBottom: 24 }}>
				<Link to="/">Home</Link>
				<Link to="/about">About</Link>
				<Link to="/contacts">Contatti</Link>
			</nav>

			<Route path="/">
				<p>👋 Benvenuto nella Home.</p>
			</Route>

			<Route path="/about">
				<p>ℹ️ Questa pagina è renderizzata dalla route "/about".</p>
			</Route>

			<Route path="/contacts">
				<p>✉️ Scrivici a esempio@jon.dev</p>
			</Route>

			<CurrentPath />
		</div>
	)
}

/** mostra il path corrente leggendolo dallo store */
function CurrentPath() {
	const state = useStore(routerStore)
	return (
		<footer style={{ marginTop: 32, color: "#888" }}>
			path corrente: <code>{state.path}</code>
		</footer>
	)
}
