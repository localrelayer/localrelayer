import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import AssetPairCardContainer from '..';


const AssetPairCardContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    assetPairCard={(
      <AssetPairCardContainer />
    )}
  />
);

storiesOf('Containers|AssetPairCardContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    AssetPairCardContainerStory,
  )
  .add(
    'full screen',
    AssetPairCardContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
