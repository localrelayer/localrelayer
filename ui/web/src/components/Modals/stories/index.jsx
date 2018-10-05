import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
} from '@storybook/addon-knobs';

import 'web-styles/main.less';
import GasModal from '../GasModal';


storiesOf('Components|GasModal', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    GasModal,
    {
      info: {
        text: `
          TradingHistory component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'full screen',
    GasModal,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
