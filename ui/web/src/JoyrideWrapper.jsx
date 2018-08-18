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
import {
  Modal,
} from 'antd';
import tokenByAddress from './assets/tokenByAddress.png';

type Props = {
  shouldRunTutorial: boolean,
  dispatch: Dispatch<*>,
  autoStart?: boolean,
};

const steps = [
  {
    title: '1. Make sure your wallet is connected',
    textAlign: 'center',
    text: (
      <div>
        <article>
        You need to use Metamask to interact with exchange.
        Ledger support is in development.
        </article>
      </div>
    ),
    selector: '#account',
    position: 'bottom',
  },
  {
    title: '2. Select token you want to trade',
    textAlign: 'center',
    text: (
      <div>
        <article>
          If you can't find the desired token, click "Token by address" button.
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 10,
          }}
          >
            <img style={{ height: 60 }} src={tokenByAddress} alt="Token by address" />
          </div>
          You can also just enter the token address in url.
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
      You need to convert your ETH (Ethereum) to WETH (Wrapped Ethereum Tokens).
        </article>
        <br />
        <article>
          <a rel="noopener noreferrer" target="_blank" href="https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2">WETH is a smart token</a> - you can anytime exchange ETH/WETH back and forth at 1:1 rate. You can read about WETH in more details <a href="https://weth.io/">here</a>.
        </article>
        <br />
        <article>
          P.S. Don't wrap all ETH - you'll need a tiny amount to pay gas
        </article>
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
        You need to allow the 0x protocol to exchange the token from your wallet. All tokens stay in your wallet until a trade completes.
        </article>
        <br />
        <article>
          For more details look <a href="https://tokenallowance.io/">here.</a>
        </article>
      </div>
    ),
    textAlign: 'center',
    selector: '.unlock',
    position: 'top',
  },
  {
    title: '5. Choose order from the order book',
    text: (
      <div>
        <article>
          You can click on desired order to fill up the buy form.
        </article>
      </div>
    ),
    textAlign: 'center',
    selector: '#Order-book',
    position: 'right',
  },
  {
    title: '6. Create a new order',
    text: (
      <div>
        <article>
          As soon as matched order will be found - your order will be filled.
        </article>
      </div>
    ),
    textAlign: 'center',
    selector: '#orderForm',
    position: 'left',
  },
];

class JoyrideWrapper extends Component<Props> {
  componentDidMount() {
    const hasVisited = localStorage.getItem('visited');
    if (!hasVisited) {
      this.props.dispatch(setUiState('shouldRunTutorial', true));
      this.props.dispatch(setUiState('joyRideAutoStart', false));
      localStorage.setItem('visited', true);
    }
  }

  handleJoyrideCallback = (result) => {
    this.props.dispatch(setUiState('joyRideAutoStart', true));

    console.log(result);

    if (result.type === 'finished' && this.props.shouldRunTutorial) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.joyride.reset(true);
      this.props.dispatch(setUiState('shouldRunTutorial', false));
    }

    if (result.type === 'error:target_not_found') {
      this.joyride.reset(true);
      this.props.dispatch(setUiState('shouldRunTutorial', false));
      Modal.info({ title: 'To continue tour, please connect a wallet' });
    }

    if (result.action === 'close' && this.props.shouldRunTutorial) {
      this.joyride.reset(true);
      this.props.dispatch(setUiState('shouldRunTutorial', false));
    }
  }

  render() {
    const { shouldRunTutorial, autoStart } = this.props;
    return <Joyride
      scrollToFirstStep
      ref={(e) => { this.joyride = e; }}
      type="continuous"
      steps={steps}
      stepIndex={0}
      // debug
      autoStart={autoStart}
      showSkipButton
      showStepsProgress
      run={shouldRunTutorial}
      callback={this.handleJoyrideCallback}
    />;
  }
}
const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  shouldRunTutorial: state.ui.shouldRunTutorial,
  autoStart: state.ui.joyRideAutoStart,
});

JoyrideWrapper.defaultProps = {
  autoStart: true,
};


export default connect(mapStateToProps)(JoyrideWrapper);
