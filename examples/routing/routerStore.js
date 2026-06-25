import { createStore } from "@priolo/jon"

/**
 * STORE che gestisce il routing dell'applicazione.
 *
 * L'unico "stato" del router è il path corrente (es. "/", "/about", "/users/42").
 * Lo teniamo sincronizzato con la URL del browser (history API) così che
 * i pulsanti avanti/indietro continuino a funzionare.
 */
const routerStore = createStore({

	state: {
		/** path attualmente visualizzato */
		path: window.location.pathname,
	},

	getters: {
		/**
		 * true se il path corrente combacia con quello passato.
		 * @param {string} path il path da confrontare
		 */
		isCurrent: (path, store) => store.state.path === path,
	},

	actions: {
		/**
		 * Naviga verso un nuovo path:
		 * - aggiorna la URL del browser (senza ricaricare la pagina)
		 * - aggiorna lo stato dello store (che fa ri-renderizzare le view)
		 * @param {string} path il path di destinazione
		 */
		goto: (path, store) => {
			if (store.state.path === path) return
			window.history.pushState({}, "", path)
			store.setPath(path)
		},

		/**
		 * Allinea lo stato alla URL corrente del browser.
		 * Va chiamata in risposta all'evento "popstate" (avanti/indietro).
		 */
		sync: (_, store) => {
			store.setPath(window.location.pathname)
		},
	},

	mutators: {
		/** imposta il path corrente */
		setPath: (path) => ({ path }),
	},
})

// Quando l'utente usa avanti/indietro del browser, riallineiamo lo store.
window.addEventListener("popstate", () => routerStore.sync())

export default routerStore
