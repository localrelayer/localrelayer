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

type Props = {

};

/**
 * Footer
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const Footer = (): Node => (
  <FooterContainer>
    <LinksContainer>
      <a target="_blank" rel="noopener noreferrer" href="https://t.me/instex">Telegram (Support)</a>
      <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/Instex_0x">Twitter</a>
      <a href="mailto:hi@instex.io">Email</a>
    </LinksContainer>
    <AlignRight>
      <LinksContainer>
        <a target="_blank" rel="noopener noreferrer" href="https://goo.gl/forms/R5vADvEL1c4Q6gI43">Submit token</a>
        <Link to="/faq">FAQ</Link>
        <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/Instex_0x">Guide</a>
      </LinksContainer>
    </AlignRight>
  </FooterContainer>
);

export default Footer;
