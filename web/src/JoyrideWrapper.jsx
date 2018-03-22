import React, { Component } from 'react';
import Joyride from 'react-joyride';
import type {
  MapStateToProps,
} from 'react-redux';
import type { Dispatch } from 'redux';

import {
  connect,
} from 'react-redux';
import {
  setUiState,
} from 'instex-core/actions';

type Props = {
  shouldRunTutorial: boolean,
  dispatch: Dispatch<*>,
};

const steps = [
  {
    title: '1. Connect your wallet',
    textAlign: 'center',
    text: (
      <div>
        <article>
        You need to use Metamask (Ledger support is in progress) to interact with exchange
        </article>
      </div>
    ),
    selector: '#account',
    position: 'top',
  },
  {
    title: '2. Select token you want to trade',
    textAlign: 'center',
    text: (
      <div>
        <article>
          If you can't find the desired token, try entering the token address in url.
          For example:
        </article>
        <br />
        <code>{window.location.origin}/tokenAddress-WETH</code>
      </div>
    ),
    selector: '#selectTokenButton',
    position: 'top',
  },
  {
    title: '3. Wrap your ETH',
    textAlign: 'center',
    text: (
      <div>
        <article>
      You need to convert your ETH (Ethereum Tokens ) to WETH (Wrapped Ethereum Tokens).
        </article>
        <br />
        <article>
          <a rel="noopener noreferrer" target="_blank" href="https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2">WETH is a smart contract</a> - you can exchange ETH to WETH and back as 1:1 any time.
        </article>
        <br />
        <article>
      You can read about WETH in more details <a href="https://weth.io/">here</a>.
        </article>
        <br />
      </div>
    ),
    selector: '#user-balance',
    position: 'top',
  },
  {
    title: '4. Allow trading',
    text: (
      <div>
        <article>
        All tokens stay in your wallet until a transaction completes, and WETH is transferred instantly to the seller's wallet upon completion.
        </article>
        <br />
        <article>
      To allow this type of interface to occur, users must allow 0x protocol a token to sell from their digital wallet.
        </article>
        <br />
        <article>
      For more details look <a href="https://tokenallowance.io/">here</a>
        </article>
      </div>
    ),
    textAlign: 'center',
    selector: '.unlock',
    position: 'top',
  },
  {
    title: '5. Create order',
    text: (
      <div>
        <article>
          Enter desired price, amount and order expire date and click 'Place order'.
          As soon as matched order will be found - your order will be filled.
        </article>
      </div>
    ),
    textAlign: 'center',
    selector: '#orderForm',
    position: 'top',
  },
];

class JoyrideWrapper extends Component<Props> {
  handleJoyrideCallback = (result) => {
    // if (result.type === 'step:before') {
    //   // Keep internal state in sync with joyride
    //   this.setState({ stepIndex: result.index });
    // }
    console.log(result);
    if (result.type === 'finished' && this.props.shouldRunTutorial) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.joyride.reset(true);
      this.props.dispatch(setUiState('shouldRunTutorial', false));
    }

    if (result.type === 'error:target_not_found') {
      this.joyride.reset(true);
      this.props.dispatch(setUiState('shouldRunTutorial', false));
    }

    // if (typeof joyride.callback === 'function') {
    //   joyride.callback(result);
    // } else {
    //   console.log(result);
    // }
  }

  render() {
    const { shouldRunTutorial } = this.props;
    return <Joyride
      scrollToFirstStep
      ref={(e) => { this.joyride = e; }}
      type="continuous"
      steps={steps}
      stepIndex={0}
      debug
      autoStart
      showSkipButton
      run={shouldRunTutorial}
      callback={this.handleJoyrideCallback}
    />;
  }
}
const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  shouldRunTutorial: state.ui.shouldRunTutorial,
});


export default connect(mapStateToProps)(JoyrideWrapper);
