import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import UserProfilePageLayout from 'web-components/UserProfilePageLayout';
import TutorialContainer from '..';


const TutorialTradingPageContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tutorialContainer={(
      <TutorialContainer />
    )}
  />
);

const TutorialUserProfileContainerStory = () => (
  <UserProfilePageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tutorialContainer={(
      <TutorialContainer />
    )}
  />
);

storiesOf('Containers|TutorialContainer', module)
  .addDecorator(withKnobs)
  .add(
    'trading page',
    TutorialTradingPageContainerStory,
  )
  .add(
    'user profile page',
    TutorialUserProfileContainerStory,
  );
