import React from 'react';
import styled from 'styled-components';
import macbook from '../assets/interface.png';

const StyledButton = styled.a`
  all: unset;
  margin: 70px;
  border: none;
  padding: 14px 30px;
  font-size: 1.3rem;
  border-radius: 5px;
  background: #2aa541;
  color: white;
  cursor: pointer;
  &:hover, &:active, &:focus {
    background: #4fb564;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 500;
`;

const Title2 = styled.span`
  font-size: 1.5rem;
  padding: 0 15px;
`;

const MainImg = styled.img`
  width: 70%;
  border-radius: 5px;

  @media (max-width: 960px) {
    width: 90%;
  }

  // @media (max-width: 960px) {
  //   filter: blur(2px);
  // }
`;

const Breakpoints = styled.div`
  display: flex;
  margin: 100px;

  @media (max-width: 960px) {
    flex-direction: column;
    margin: 0;
  }

  & section {
    flex: 1;
    margin: 50px;

    & img {
      height: 100px;
    }
  }
`;

export default () => (
  <main
    style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Title>Meet Instex</Title>
    <br />
    <Title2>Place where you can safely trade any ERC20 token</Title2>
    <StyledButton target="_blank" rel="noopener" href="https://app.instex.io">
      Start trading
    </StyledButton>
    <MainImg src={macbook} alt="Instex on Macbook" />
    <Breakpoints>
      <section>
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
        <h3>Any ERC20 tokens support</h3>
        <article>Trade any ERC20 token just by intering its address in url.</article>
      </section>
      <section>
        <h3>Low fees</h3>
        <article>
          Thanks to 0x protocol, we are able to lower fees comparing to centralized exchanges.
          <br />
          <br />
          Fees are always taken in received currency.
        </article>
      </section>
    </Breakpoints>
  </main>
);
