# Esempio: routing con `jon`

Routing client-side minimale usando **jon** come store, **senza** librerie di
routing esterne. Tutto sta in un unico file: [`App.tsx`](./App.tsx).

## L'idea

Il "router" è solo uno store con un `path` corrente:

```ts
const routerStore = createStore({
	state: { path: "/" },
	mutators: {
		setPath: (path: string) => ({ path }),
	},
})
```

- gli `<a>` al click chiamano `routerStore.setPath(...)` → modificano lo store;
- il componente è abbonato con `useStore(routerStore)` → si ri-renderizza ad ogni cambio di path;
- il contenuto mostrato dipende dal `path` (le "route").

```tsx
const { path } = useStore(routerStore)
...
<a href="#" onClick={() => routerStore.setPath("/about")}>About</a>
...
{path === "/about" && <p>Pagina About</p>}
```

## Come provarlo

Presuppone un'app React (es. Vite) con `@priolo/jon` installato. Monta `App`:

```tsx
import { createRoot } from "react-dom/client"
import App from "./App"

createRoot(document.getElementById("root")!).render(<App />)
```
