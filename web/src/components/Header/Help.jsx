import React from 'react';
import telegram from '../../assets/telegram.png';
import email from '../../assets/letter.png';
import twitter from '../../assets/twitter.png';
import {
  HelpContainer,
} from './styled';

export default () => (
  <HelpContainer>
    <a target="_blank" rel="noopener noreferrer" href="https://t.me/instex">
      <img src={telegram} alt="telegram" />
      Telegram
    </a>
    <a href="mailto:hi@instex.io">
      <img src={email} alt="email" />
      Email
    </a>
    <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/Instex_0x">
      <img src={twitter} alt="twitter" />
      Twitter
    </a>
  </HelpContainer>
);
