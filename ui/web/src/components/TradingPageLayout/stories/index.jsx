import React from 'react';
import {
  storiesOf,
} from '@storybook/react';

import TradingPageLayout from '..';

storiesOf('Components|TradingPageLayout', module)
  .add('preview', () => (
    <TradingPageLayout.Preview />
  ))
  .add('full screen', () => (
    <TradingPageLayout.Preview />
  ), {
    options: {
      goFullScreen: true,
    },
  });
