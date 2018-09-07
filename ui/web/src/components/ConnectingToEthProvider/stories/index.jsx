import {
  storiesOf,
} from '@storybook/react';
import ConnectingToEthProvider from '..';


storiesOf('Components|ConnectingToEthProvider', module)
  .add(
    'default',
    ConnectingToEthProvider,
  )
  .add(
    'full screen',
    ConnectingToEthProvider,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
