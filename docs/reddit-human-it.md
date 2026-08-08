**Titolo:** Ho sostituito Redux/Zustand con ~40 righe che copio-incollo in ogni progetto

Ciao,
vorrei condividere un'idea sulla gestione dello stato in React che applico da anni nei miei progetti.
Non installo nessuna libreria (Zustand, Redux, Recoil, ecc.). Ho un micro state manager (l'ho chiamato **jon**) costruito su `useSyncExternalStore` — ed è così piccolo che non lo *installo*, lo copio-incollo direttamente nel progetto.

Eccolo per intero:

```ts
import { useCallback, useSyncExternalStore } from 'react'

/** Handle dello store: `state` più i metodi del setup (non type-checked). */
export type Store<T = any> = { state: T } & Record<string, any>

/** Hook React: sottoscrive il componente e ritorna lo stato. `fn` => ri-renderizza solo se ritorna true. */
export function useStore<T>(store: Store<T>, fn?: (state: T, oldState: T) => boolean): T {
	const subscribe = useCallback((listener: any) => store._subscribe(listener, fn), [store])
	return useSyncExternalStore(subscribe, () => store.state)
}

/** Crea uno store dal setup: getters/actions/mutators diventano metodi (senza il parametro `store`). */
export function createStore(setup: any): Store {
	const listeners = new Set<any>()
	const store: Store = {
		// lo state dev'essere serializzabile: un oggetto semplice viene deep-clonato; una factory viene invocata
		state: typeof setup.state == 'function' ? setup.state() : structuredClone(setup.state ?? {}),
		_subscribe: (listener: any, fn: any) => {
			listener.fn = fn
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
	}
	for (const k in setup.getters) store[k] = (payload: any) => setup.getters[k](payload, store)
	for (const k in setup.actions) store[k] = async (payload: any) => setup.actions[k](payload, store)
	for (const k in setup.mutators) store[k] = (payload: any) => {
		// il mutator ritorna un diff parziale; se è null/undefined o non cambia nulla, salta l'update (niente re-render)
		const stub = setup.mutators[k](payload, store)
		if (stub == null || Object.keys(stub).every(k => stub[k] === store.state[k])) return
		const old = store.state
		store.state = { ...store.state, ...stub }
		for (const l of listeners) if (!l.fn || l.fn(store.state, old)) l(store.state)
	}
	return store
}
```

e... è tutto qui, non c'è altro.

## Come lo uso

L'API è in stile Vuex/Pinia: si definiscono `state`, `getters`, `actions` e `mutators`. Ogni funzione riceve lo `store` stesso come secondo argomento, così puoi chiamare i "fratelli" e leggere `store.state`:

```tsx
const counter = createStore({
	state: { count: 0 },
	getters: {
		isEven: (_, store) => store.state.count % 2 === 0,
	},
	mutators: {
		// i mutator sono l'UNICA cosa che cambia lo stato; ritornano un diff parziale
		add: (n, store) => ({ count: store.state.count + n }),
	},
})

function Counter() {
	const { count } = useStore(counter)
	return (
		<button onClick={() => counter.add(1)}>
			{count} — {counter.isEven() ? 'even' : 'odd'}
		</button>
	)
}
```

- I `mutators` sono sincroni e sono l'unico posto in cui lo stato cambia.
- Le `actions` sono per async / side effect e orchestrazione — non ritornano stato, chiamano i mutator.
- I `getters` sono valori derivati.
- `useStore(store)` sottoscrive il componente. Passa un predicato opzionale `(state, oldState) => boolean` per ri-renderizzare solo quando la parte che ti interessa è davvero cambiata.

Lo uso così da anni e non ho mai incontrato un caso in cui non bastasse, né problemi di performance / re-render.

## Ma… perché non Zustand?

Domanda legittima — anche Zustand è minuscolo e anch'esso costruito su `useSyncExternalStore`. Due ragioni per cui questo esiste:

1. **Lo copio-incollo invece di installarlo.** Il core è ~40 righe ed è stabile, quindi vive *dentro* il mio progetto. Nessuna dipendenza, nessun aggiornamento di versione, nessuna superficie di supply-chain. Se devo cambiare qualcosa, il codice è mio.
2. **La forma in stile Vuex** (`state / getters / actions / mutators`) è il modo in cui il mio cervello organizza uno store, e mi obbliga a separare nettamente il "cambio di stato sincrono" (mutators) dagli "async / side effect" (actions).

Non è "meglio di Zustand" — è "così piccolo che installare una dipendenza per farlo mi sembrava assurdo".

## Un bonus inaspettato con gli LLM

Siccome è tutto ~40 righe che vivono nel repo, un assistente LLM non ha bisogno di leggere nessuna documentazione per usarlo: l'intera implementazione è lì nel contesto, quindi capisce da solo come funziona e scrive store corretti al primo colpo. Zero superficie di API da allucinare. È risultato un effetto collaterale sorprendentemente piacevole del "niente libreria".

---

È un progetto personale; per lavoro importo una versione npm con inferenza dei tipi migliore e qualche utility, ma il comportamento di base è esattamente quello che ho condiviso qui.

Quindi — sono pazzo, o questo approccio ha davvero senso?
Andateci piano :)

p.s.: Scritto senza AI, ma l'ho fatto tradurre perché l'inglese non è la mia lingua madre e non volevo rovinare la leggibilità. Anche il progetto è mio — ho usato l'AI solo per la pagina web, gli esempi e i test.
