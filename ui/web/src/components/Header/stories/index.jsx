import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
} from '@storybook/addon-knobs';

import 'web-styles/main.less';
import {
  coreMocks,
  coreCache,
  coreSelectors as cs,
} from 'instex-core';
import Header from '..';


const listedAssetPairs = coreMocks.assetPairsJson[1].map(assetPair => ({
  id: `${assetPair.assetDataA.assetData}_${assetPair.assetDataB.assetData}`,
  ...cs.constructAssetPair({
    assetPair,
    assets: coreCache.cachedTokens[1],
    decodeTokenAddress: true,
  }),
}));
const currentAssetPair = listedAssetPairs[0];

const HeaderStory = () => (
  <Header
    listedAssetPairs={listedAssetPairs}
    currentAssetPair={currentAssetPair}
  />
);

storiesOf('Components|Header', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    HeaderStory,
  )
  .add(
    'full screen',
    HeaderStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
