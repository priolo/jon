import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'NO Magic',
    Svg: require('@site/static/img/no-magic.svg').default,
    description: (
      <>
        No hidden runtime, no secrets. The whole store is ~30 lines of code on
        top of React's native <code>useSyncExternalStore</code> — right in front
        of you. It's so plain that you, or even an AI agent, can read it end to
        end, understand it, and start using it in one sitting.
      </>
    ),
  },
  {
    title: 'NO Multi-Purpose',
    Svg: require('@site/static/img/no-multitool.svg').default,
    description: (
      <>
        Jon does ONE thing: manage the store —{' '}
        <code>state</code>, <code>getters</code>, <code>actions</code> and{' '}
        <code>mutators</code>, fully type-inferred.
        Nothing else, on purpose.
      </>
    ),
  },
  {
    title: 'NO Chaos',
    Svg: require('@site/static/img/no-community.svg').default,
    description: (
      <>
        Zero production dependencies (React is a peer dependency) — nothing to
        audit, no dependency tree to trust. Bugs get fixed, but Jon's API is
        stable and won't churn under you.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
