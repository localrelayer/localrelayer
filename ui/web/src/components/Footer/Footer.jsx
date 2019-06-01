// @flow
import React from 'react';

import type {
  Node,
} from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  FooterContainer,
  LinksContainer,
} from './styled';
import {
  AlignRight,
} from '../SharedStyles';


const Footer = (): Node => (
  <FooterContainer>
    <LinksContainer>
      <a target="_blank" rel="noopener noreferrer" href="https://t.me/localrelayer">Telegram (Support)</a>
      <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/localrelayer">Twitter</a>
      <a href="mailto:hi@localrelayer.com">Email</a>
    </LinksContainer>
    <AlignRight>
      <LinksContainer>
        {/* <a target="_blank" rel="noopener noreferrer" href="https://goo.gl/forms/R5vADvEL1c4Q6gI43">Submit token</a> */}
        <Link to="/faq">FAQ</Link>
        <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/localrelayer">Guide</a>
      </LinksContainer>
    </AlignRight>
  </FooterContainer>
);

export default Footer;
