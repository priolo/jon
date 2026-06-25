import React from "react"
import { useStore } from "@priolo/jon"
import routerStore from "./routerStore"

/**
 * <Link to="/about">...</Link>
 * Un semplice link che naviga tramite lo store invece di ricaricare la pagina.
 */
export function Link({ to, children }) {
	// ci abboniamo allo store per evidenziare il link "attivo"
	const state = useStore(routerStore)
	const isActive = state.path === to

	const onClick = (e) => {
		e.preventDefault()
		routerStore.goto(to)
	}

	return (
		<a
			href={to}
			onClick={onClick}
			style={{ fontWeight: isActive ? "bold" : "normal", marginRight: 12 }}
		>
			{children}
		</a>
	)
}

/**
 * <Route path="/about"> ... </Route>
 * Renderizza i propri figli SOLO quando il path corrente combacia.
 */
export function Route({ path, children }) {
	// ri-renderizza solo quando cambia il path (ottimizzazione opzionale)
	const state = useStore(routerStore, (s, old) => s.path !== old.path)
	return state.path === path ? <>{children}</> : null
}
