// jon · routing example
// https://codesandbox.io/p/sandbox/routing-s32zxk

import { useStore, type StoreCore } from "@priolo/jon";
import routerStore from "./routerStore.js";

export default function App() {
  // subscribe to the store: the component re-renders on every change of path
  useStore(routerStore as StoreCore<any>);

  const about = routerStore.match("/param/{par1}/test/{par2}");

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>jon · routing example</h1>

      <nav style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <a href="#" onClick={() => routerStore.goto("/")}>
          Home
        </a>
        <a href="#" onClick={() => routerStore.goto("/param/3/test/value")}>
          About
        </a>
        <a href="#" onClick={() => routerStore.goto("/contacts")}>
          Contacts
        </a>
      </nav>

      {routerStore.match("/") && <p>Welcome to the Home page.</p>}
      {about && (
        <p>
          About page · par1 = <code>{about.par1}</code>, par2 ={" "}
          <code>{about.par2}</code>
        </p>
      )}
      {routerStore.match("/contacts") && <p>Write to us at example@jon.dev</p>}

      <footer style={{ marginTop: 32, color: "#888" }}>
        current path: <code>{routerStore.state.path}</code>
      </footer>
    </div>
  );
}
