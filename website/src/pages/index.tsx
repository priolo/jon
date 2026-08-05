import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

// The juice file source is read at build time straight from the library,
// so the snippet on the site always matches src/lib/store/rvx_juice.ts.
const juiceSource: string =
  require('!!raw-loader!../../../src/lib/store/rvx_juice.ts').default;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link style={{ color: "white"}}
            className="button button--secondary button--lg"
            to="/docs/why">
            Why Jon? - 5min
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageCopyPaste() {
  return (
    <section className={styles.copyPaste}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2">You don't even need to install it!</Heading>
          <p>
            The whole store fits in a single self-contained file.
            Copy <Link href="https://github.com/priolo/jon/blob/master/src/lib/store/rvx_juice.ts">
            <code>rvx_juice.ts</code></Link> into your project and you're done:
            a fully typed store pattern for React, built directly on the native{' '}
            <code>useSyncExternalStore</code> hook.
            No dependency in your <code>package.json</code>, no supply chain to trust —
            you own the code.
          </p>
        </div>
        <div className="row">
          <div className={clsx('col col--6', styles.codeCol)}>
            <CodeBlock language="ts" title="rvx_juice.ts — copy this file...">
              {juiceSource}
            </CodeBlock>
          </div>
          <div className={clsx('col col--6', styles.codeCol)}>
            <CodeBlock language="tsx" title="my-project/src/Counter.tsx — ...and use it!">
{`import { createStore, useStore } from './rvx_juice'

const myStore = createStore({
  state: {
    count: 0,
  },
  getters: {
    isEven: (_: void, store) => store.state.count % 2 === 0,
  },
  actions: {
    increment: (_: void, store) => {
      store.setCount(store.state.count + 1)
    },
  },
  mutators: {
    setCount: (count: number) => ({ count }),
  },
})

export default function Counter() {
  const { count } = useStore(myStore)
  return (
    <button onClick={() => myStore.increment()}>
      {count} is {myStore.isEven() ? 'even' : 'odd'}
    </button>
  )
}`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Jon is a minimalist React state-management library: a fully typed store in ~80 lines built on useSyncExternalStore, with zero dependencies. Install it from npm or just copy-paste a single file.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageCopyPaste />
      </main>
    </Layout>
  );
}
