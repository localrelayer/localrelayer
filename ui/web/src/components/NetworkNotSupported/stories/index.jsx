import {
  storiesOf,
} from '@storybook/react';
import NetworkNotSupported from '..';


storiesOf('Components|NetworkNotSupported', module)
  .add(
    'default',
    NetworkNotSupported,
  )
  .add(
    'full screen',
    NetworkNotSupported,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
