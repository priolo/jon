Per la mia esperienza il grosso problema che ho avuto passando a REACT  
è che non propone un pattern globale per gestire la business logic.

Ho revisionato codice in cui i dati e callback   
sono passati ad una serie infinita di componenti.  
Ogni modifica era un dolore, soprattutto spostare un componente dalla sua gerarchia.

[REDUX](https://redux.js.org/) è molto interessante ma è troppo prolisso per il mio stile.  
REACT mette a disposizione strumenti "nativi":  
[PROVIDER](https://it.reactjs.org/docs/context.htm) e [REDUCER](https://it.reactjs.org/docs/hooks-reference.html#usereducer)  
ma, secondo me, sono troppo basilari per per usarli direttamente.

Quindi ho scritto una "utility" (NON una "libreria") servita in diversi progetti  
molto molto leggera.

https://gitlab.com/priolo22/jon

Esempio base:

### Create STORE
`my_app/myStore.js`
```jsx
export default {
	state: {
		value: "init value",
	},
	getters: {
		getUppercase: (state) => state.value.toUpperCase(),
	},
	actions: {
		fetch: async (state, payload, store) => {
			//const {response} = await ajax.get(`my_server`)
			//store.setValue(response)
		}
	},
	mutators: {
		setValue: (state, value) => ({ value }),
	},
}
```

### Create PROVIDER
`my_app/index.js`
```js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { MultiStoreProvider, setupStore } from '@priolo/jon';
import myStore from "./myStore"
setupStore({ myStore })

const rootElement = document.getElementById("root");
ReactDOM.render(
  <MultiStoreProvider>
    <App />
  </MultiStoreProvider>,
  rootElement
);
```

### Use STORE
`my_app/App.js`
```jsx
import { useStore } from "@priolo/jon";
import React from "react";

export default function App() {

  const { state, setValue, getUppercase } = useStore("myStore")

  return (<div>
      <h1>{state.value}</h1><h2>{getUppercase()}</h2>
      <input onChange={(e)=>setValue(e.target.value)} />
  </div>);
}
```

[online](https://codesandbox.io/s/react-store-example-1-ct8r4)

Spero sia utile, sono un gran fan di VUEX da cui ho tratto spunto
Ciao