import React from 'react';
import styled from 'styled-components';
import macbook from '../assets/macbook.png';
import locked from '../assets/safebox-1.svg';
import ethereum from '../assets/ethereum-1.svg';
import fees from '../assets/tag.svg';

const StyledButton = styled.a`
  all: unset;
  margin: 50px;
  border: none;
  padding: 14px 30px;
  font-size: 1.3rem;
  border-radius: 5px;
  background: #663fb4;
  color: white;
  cursor: pointer;

  &:hover,
  &:active,
  &:focus {
    background: #8268b7;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
`;

const Title2 = styled.span`
  font-size: 1.5rem;
`;

const Breakpoints = styled.div`
  display: flex;
  margin: 100px;
  & section {
    flex: 1;
    margin: 50px;

    & img {
      height: 200px;
    }
  }
`;

export default () => (
  <main
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Title>Meet Instex</Title>
    <Title2>Place where you can safely trade any ERC20 token</Title2>
    <StyledButton target="_blank" rel="noopener" href="https://app.instex.io">
      Start trading
    </StyledButton>
    <img style={{ width: '100%' }} src={macbook} alt="Instex on Macbook" />

    <Breakpoints>
      <section>
        <img src={locked} alt="security" />
        <h3>Security and Privacy</h3>
        <article>
          All your assets are safely stored in your wallet while our matching engine is looking for
          suitable order.
          <br />
          <br />
          No verification needed, you'll remain anonim at any trade phase, only your ethereum
          address will be exposed.
        </article>
      </section>
      <section>
        <img src={fees} alt="fees" />
        <h3>Low fees</h3>
        <article>
          Thanks to 0x protocol, we are able to lower fees comparing to centralized exchanges.
          <br />
          <br />
          Fees are always taken in received currency.
        </article>
      </section>
      <section>
        <img src={ethereum} alt="ethereum" />
        <h3>Any ERC20 tokens support</h3>
        <article>Trade any ERC20 token just by intering its address in url.</article>
      </section>
    </Breakpoints>
  </main>
);
