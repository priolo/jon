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
        Jon is ~80 lines of TypeScript on top of React's native{' '}
        <code>useSyncExternalStore</code>. What it does is clear!
        You can read the whole source in one sitting — or just copy-paste it
        into your project and own the code.
      </>
    ),
  },
  {
    title: 'NO Multi-Purpose',
    Svg: require('@site/static/img/no-multitool.svg').default,
    description: (
      <>
        Jon is designed ONLY to manage the STORE:{' '}
        <code>state</code>, <code>getters</code>, <code>actions</code> and{' '}
        <code>mutators</code>, fully type-inferred.
        It serves no other purpose!
      </>
    ),
  },
  {
    title: 'NO Chaos',
    Svg: require('@site/static/img/no-community.svg').default,
    description: (
      <>
        Zero production dependencies (React is a peer dependency).
        Any bug reported will be fixed, but Jon's API is stable and will
        remain unchanged for a long time.
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
