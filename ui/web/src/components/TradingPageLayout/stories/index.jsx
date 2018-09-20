import React from 'react';
import {
  storiesOf,
} from '@storybook/react';

import TradingPageLayout from '..';

storiesOf('TradingPageLayout', module)
  .add('trading-page-layout-default', () => (
    <TradingPageLayout.Preview />
  ));
