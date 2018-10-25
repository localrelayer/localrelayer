import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import 'web-styles/main.less';
import UserBalance from '..';


const UserBalanceStory = () => (
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
        onToggle={() => {
          console.log('onToggle');
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
    'default',
    UserBalanceStory,
    {
      info: {
        text: `
          UserBalance description...
        `,
      },
    },
  )
  .add(
    'full screen',
    UserBalanceStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
