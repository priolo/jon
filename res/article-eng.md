In my experience the big problem I had by switching to REACT
is that it does not propose a global pattern to manage the business logic.

I have reviewed code where data and callbacks
have passed to an infinite series of components.
Any modification was a pain, especially to move a component out of its hierarchy.

[REDUX](https://redux.js.org/) is very interesting but too verbose for my style.  
REACT provides "native" tools: 
[PROVIDER](https://it.reactjs.org/docs/context.htm) and [REDUCER](https://it.reactjs.org/docs/hooks-reference.html#usereducer)  
but, in my opinion, they are too basic to use them directly.

So I wrote a "utility" (NOT a "library") served in several projects
very very light.

https://gitlab.com/priolo22/iistore

Basic example:

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

import { MultiStoreProvider, setupStore } from '@priolo/iistore';
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
import { useStore } from "@priolo/iistore";
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

Hope it's useful, I'm a huge fan of VUEX which I got my inspiration from
Bye!