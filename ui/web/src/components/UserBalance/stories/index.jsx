import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import UserProfileLayout from 'web-components/UserProfileLayout';
import 'web-styles/main.less';
import UserBalance from '..';


const UserBalanceTradingPageStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userBalance={(
      <UserBalance
        balance={3}
        assets={[{
          symbol: 'WETH',
          fullBalance: 200,
          balance: 100,
          isTradable: true,
        }, {
          symbol: 'ZRX',
          fullBalance: 0,
          balance: 0,
          isTradable: false,
        }]}
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

const UserBalanceUserProfileStory = () => (
  <UserProfileLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userBalance={(
      <UserBalance
        balance={3}
        assets={[{
          symbol: 'WETH',
          name: 'Wrapped Eth',
          fullBalance: 200,
          balance: 100,
          isTradable: true,
        }, {
          symbol: 'ZRX',
          name: '0x Protocol',
          fullBalance: 0,
          balance: 0,
          isTradable: false,
        }]}
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

storiesOf('Components|UserBalance', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [UserBalance],
    },
  })
  .add(
    'trading page',
    UserBalanceTradingPageStory,
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
    UserBalanceUserProfileStory,
  );
