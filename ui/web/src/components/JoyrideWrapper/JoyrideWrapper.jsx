// @flow
import React from 'react';
import Joyride from 'react-joyride';

import * as S from './styled';

type Props = {
  isJoyrideVisible: boolean,
};

class JoyrideWrapper extends React.Component<Props> {
  state = {
    steps: [
      {
        title: (
          <S.StoryHeader>
            1. Make sure your wallet is connected
          </S.StoryHeader>
        ),
        content: (
          <div>
            <article>
              You need to use Metamask to interact with exchange.
            </article>
          </div>
        ),
        target: '#userProfileAddress',
        placement: 'bottom',
      },
      {
        title: (
          <S.StoryHeader>
            2. Select pair you want to trade
          </S.StoryHeader>
        ),
        content: (
          <div />
        ),
        target: '#tradingPairs',
        placement: 'bottom',
      },
      {
        title: (
          <S.StoryHeader>
            3. Wrap your ETH
          </S.StoryHeader>
        ),
        content: (
          <div>
            <article>
              You need to convert your ETH (Ethereum) to WETH (Wrapped Ethereum Tokens).
            </article>
            <br />
            <article>
              <S.Link
                rel="noopener noreferrer"
                target="_blank"
                href="https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
              >
                WETH is a smart token
              </S.Link>
              {' '}
              - you can anytime exchange ETH/WETH back and forth at 1:1 rate.
              You can read about WETH in more details
              <S.Link
                href="https://weth.io/"
                target="_blank"
              >
                {' '}
                here
              </S.Link>
            </article>
            <br />
            <article>
              P.S. Do not wrap all ETH - you will need a tiny amount to pay gas
            </article>
          </div>
        ),
        target: '#etherWrapper',
        placement: 'right',
      },
      {
        title: (
          <S.StoryHeader>
            4. Allow trading
          </S.StoryHeader>
        ),
        content: (
          <div>
            <article>
              You need to allow the 0x protocol to exchange the token from your wallet.
              All tokens stay in your wallet until a trade completes.
            </article>
            <br />
            <article>
              For more details look
              {' '}
              <S.Link
                href="https://tokenallowance.io/"
                target="_blank"
              >
                here.
              </S.Link>
            </article>
          </div>
        ),
        target: '#balanceTable tbody tr',
        placement: 'bottom',
      },
      {
        title: (
          <S.StoryHeader>
            5. Choose order from orderBook
          </S.StoryHeader>
        ),
        content: (
          <div>
            <article>
              You can hover on desired order and take it
            </article>
          </div>
        ),
        target: '#orderBook',
        placement: 'right',
      },
      {
        title: (
          <S.StoryHeader>
            6. Create a new order
          </S.StoryHeader>
        ),
        content: (
          <div>
            <article>
              It will appear in the OrderBook
            </article>
          </div>
        ),
        target: '#buySellForm',
        placement: 'right',
      },
    ],
  };

  render() {
    const { steps } = this.state;
    const { isJoyrideVisible } = this.props;
    return (
      <Joyride
        run={
          window.location.pathname !== '/account'
          && isJoyrideVisible
        }
        steps={steps}
        scrollToFirstStep
        showSkipButton
        continuous
        styles={{
          options: S.options,
        }}
      />
    );
  }
}

export default JoyrideWrapper;
