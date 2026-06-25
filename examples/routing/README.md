# Esempio: routing con `jon`

Questo esempio mostra come usare **jon** come store per implementare un
routing client-side minimale, **senza** alcuna libreria di routing esterna.

## L'idea

Il "router" è semplicemente uno store con:

- **state** → il `path` corrente (sincronizzato con `window.location`);
- **action `goto(path)`** → aggiorna la URL del browser (`history.pushState`) e lo stato;
- **action `sync()`** → riallinea lo stato quando si usano i tasti avanti/indietro;
- **mutator `setPath`** → scrive il nuovo path nello stato;
- **getter `isCurrent`** → utile per evidenziare la voce di menu attiva.

Quando l'action `goto` aggiorna lo stato, tutti i componenti abbonati con
`useStore` si ri-renderizzano: i `<Route>` mostrano/nascondono il contenuto
e i `<Link>` evidenziano la voce attiva.

## File

| File | Contenuto |
|------|-----------|
| `routerStore.js` | lo store che gestisce il path |
| `components.jsx` | i componenti `<Link>` e `<Route>` |
| `App.jsx`        | la pagina di esempio che li usa |

## Punti chiave

```js
// navigare = chiamare un'action dello store
routerStore.goto("/about")

// reagire al cambio di path = abbonarsi con useStore
const { path } = useStore(routerStore)
```

`<Route>` usa anche il predicato di re-render condizionale di `useStore`
per aggiornarsi **solo** quando cambia effettivamente il path:

```js
const state = useStore(routerStore, (s, old) => s.path !== old.path)
```

## Come provarlo

Questi file presuppongono un'app React (es. Vite) con `@priolo/jon` installato.
Monta il componente `App` come root:

```jsx
import { createRoot } from "react-dom/client"
import App from "./App"

createRoot(document.getElementById("root")).render(<App />)
```
