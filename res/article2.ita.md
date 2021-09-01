React è facile da utilizzare per creare la "VIEW".
Ma quando l'applicazione cresce ...non basta!
Passare variabili e metodi nelle "props" trasforma 
il codice in foglie impigliate nei nodi dell'albero della VIEW!

Un esempio pratico:

```jsx
import { useState } from "react"

// main with "data"
export default function App() {
  const [data, setData] = useState(0)
  return (
    <div className="App">
      <ShowDataCmp data={data} />
      <ContainerCmp data={data} onChange={setData} />
    </div>
  )
}

// render data
function ShowDataCmp({ data }) {
  const renderData = `Data: ${data}`
  return <div>{renderData}</div>
}

// simple container
function ContainerCmp({ data, onChange }) {
  return <div style={{ background: "blue", padding: "5px" }}>
    <ChangeDataCmp data={data} onChange={onChange} />
  </div>
}

// component for change data
function ChangeDataCmp({ data, onChange }) {
  const handleOnClick = (e) => {
    const newData = data + 1
    onChange(newData)
  }
  return <button onClick={handleOnClick}>Change Data</button>
}
```
[sandbox](https://codesandbox.io/s/exe-0-with-props-l5fjc)

![Frame 3](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/aev4our5m2zxg32vqr49.png)

Codice e dati sono mischiati nella VIEW. 
Se l'applicazione crescesse non si capirebbe da dove vengono i dati e i metodi. 
Diciamocelo: **così è una vera merda!**

---

## Context

Il [Context](https://it.reactjs.org/docs/context.html) è la soluzione "nativa" di React.

Rielaborando l'esempio precedente otteniamo:

```jsx
import { createContext, useContext, useState } from "react"

const Context = createContext()

// main with "data"
export default function App() {
  const reducer = useState(0)
  return (
    <div className="App">
      <Context.Provider value={reducer}>
        <ShowDataCmp />
        <ContainerCmp />
      </Context.Provider>
    </div>
  )
}

// render data
function ShowDataCmp() {
  const reducer = useContext(Context)
  const renderData = `Data: ${reducer[0]}`
  return <div>{renderData}</div>
}

// simple container
function ContainerCmp() {
  return <div style={{ background: "blue", padding: "5px" }}>
    <ChangeDataCmp />
  </div>
}

// component for change data
function ChangeDataCmp() {
  const reducer = useContext(Context)
  const handleOnClick = (e) => {
    const newData = reducer[0] + 1
    reducer[1](newData)
  }
  return <button onClick={handleOnClick}>Change Data</button>
}
```

[sandbox](https://codesandbox.io/s/exe-1-with-context-5w0lb)

![Frame 4](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lsyub63a8o2phpepuokk.png)

Non male! Ma ci sono due problemi:  
- Dobbiamo creare CONTEXT e STATE per ogni STOREs. Se ci fossero molti STOREs la complessità aumenterebbe.
- Non è chiaro come dividere la BUSINESS LOGIC dalla VIEW

---

## STOREs

E veniamo agli STORE!
Ci sono un mucchio di librerie la fuori! 
Se vuoi rimanere leggero usa: [JON](https://github.com/priolo/jon)
è solo un po' di zucchero sui "Provider nativi"
con una forte influenza da [VUEX](https://vuex.vuejs.org/)
 
Il nostro esempio potrebbe essere:

```jsx
import { MultiStoreProvider, useStore } from "@priolo/jon"

const myStore = {
  state: {
    counter: 0
  },
  getters: {
    renderData: (state, _, store) => `Data: ${state.counter}`
  },
  actions: {
    increment: (state, step, store) => {
      store.setCounter(state.counter + step)
    }
  },
  mutators: {
    setCounter: (state, counter, store) => ({ counter })
  }
}

// main with "data"
export default function App() {
  return (
    <MultiStoreProvider setups={{ myStore }}>
      <div className="App">
        <ShowDataCmp />
        <ContainerCmp />
      </div>
    </MultiStoreProvider>
  )
}

// render data
function ShowDataCmp() {
  const { renderData } = useStore("myStore")
  return <div>{renderData()}</div>
}

// simple container
function ContainerCmp() {
  return (
    <div style={{ background: "blue", padding: "5px" }}>
      <ChangeDataCmp />
    </div>
  )
}

// component for change data
function ChangeDataCmp() {
  const { increment } = useStore("myStore")
  const handleOnClick = (e) => increment(1)
  return <button onClick={handleOnClick}>Change Data</button>
}
```

[sandbox](https://codesandbox.io/s/exe-2-with-jon-m1ffj)

![Frame 5](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oqkjl8bmnuu1q1xco3cm.png)

Ora React renderizza la VIEW e lo STORE contiene tutta la logica dell'applicazione.
"myStore" è un semplice oggetto javascript con i parametri:

#### state 
lo STATE iniziale dello STORE, tipicamente un oggetto JSON.
Questo è collegato alla VIEW (tramite React): 
Quando lo STATE cambia la VIEW si aggiorna in automatico!
Per accedere allo STATE di uno STORE usare:
`

#### getters
Nonostante tu possa accedere allo STATE direttamente in molti casi vorrai dei dati elaborati. Per esempio una lista filtrata