// @flow
import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import {
  coreCache,
} from 'instex-core';
import TradingPageLayout from 'web-components/TradingPageLayout';
import UserProfilePageLayout from 'web-components/UserProfilePageLayout';
import 'web-styles/main.less';
import UserBalance from '..';


type Props = {
  isTradingPage: boolean,
};

const allAssets = Object.values(coreCache.cachedTokens[1]).map(asset => ({
  ...asset,
  fullBalance: 200,
  balance: 100,
  isTradable: true,
}));

const UserBalanceStory = ({ isTradingPage = false }: Props) => {
  const PreviewComponent = (
    isTradingPage
      ? TradingPageLayout.Preview
      : UserProfilePageLayout.Preview
  );
  return (
    <PreviewComponent
      hideRest={boolean('Hide preview layout', false)}
      userBalance={(
        <UserBalance
          isTradingPage={isTradingPage}
          balance={3}
          assets={(
            isTradingPage
              ? [
                allAssets.find(a => a.symbol === 'ZRX'),
                allAssets.find(a => a.symbol === 'WETH'),
              ]
              : allAssets
          )}
          onWithdraw={() => {
            console.log('onWithdraw');
          }}
          onDeposit={() => {
            console.log('onDeposit');
          }}
          onToggleTradable={() => {
            console.log('onToggleTradable');
          }}
        />
      )}
    />
  );
};

storiesOf('Components|UserBalance', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [UserBalance],
    },
  })
  .add(
    'trading page',
    () => (
      <UserBalanceStory isTradingPage />
    ),
    {
      info: {
        text: `
          UserBalance description...
        `,
      },
    },
  )
  .add(
    'user profile page',
    () => (
      <UserBalanceStory />
    ),
  );
