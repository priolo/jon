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
        What it does is clear!
        You can also take the code (about 60 lines) and paste it into your project
      </>
    ),
  },
  {
    title: 'NO Multi-Purpose',
    Svg: require('@site/static/img/no-multitool.svg').default,
    description: (
      <>
        Designed ONLY to manage the STORE
        It serves no other purpose!
      </>
    ),
  },
  {
    title: 'NO Caos',
    Svg: require('@site/static/img/no-community.svg').default,
    description: (
      <>
        Any bugs reported will be fixed.
        But Jon will remain unchanged for quite some time
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
