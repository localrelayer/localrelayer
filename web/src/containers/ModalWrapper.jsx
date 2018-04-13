// @flow

import React from 'react';
import {
  Modal,
  Button,
} from 'antd';
import {
  connect,
} from 'react-redux';
import {
  change,
} from 'redux-form';
import {
  setUiState,
  callContract,
} from 'instex-core/actions';
import {
  getCurrentToken,
  getCurrentPair,
} from 'instex-core/selectors';
import type { Token } from 'instex-core/types';
import type {
  Dispatch,
} from 'redux';

type Props = {
  activeModal: string,
  dispatch: Dispatch<*>,
  token: Token,
  txHash: string,
  wrapAmount: string,
};

const ModalWrapper = ({
  activeModal,
  dispatch,
  token,
  txHash,
  wrapAmount,
}: Props) => (
  <div>
    <Modal
      title={`You need to enable "${token.name}" trading`}
      visible={activeModal === 'AllowanceModal'}
      onCancel={() => dispatch(setUiState('activeModal', ''))}
      footer={[
        <Button key="cancel" onClick={() => dispatch(setUiState('activeModal', ''))} type="default">Cancel</Button>,
        <Button key="ok" onClick={() => dispatch(callContract('setAllowance', token))} type="primary">Enable</Button>,
      ]}
    >
      <article>You'll be able create the order after you allow the token trading</article>
      <br />
      <article>Setting this allowance does not mean you are giving your tokens to the 3rd party. All it means is you are willingly allowing the Smart Contract to transfer on your behalf.</article>
      <br />
      <article>You can read about allowance in more details {' '}
        <a rel="noopener noreferrer" target="_blank" href="https://tokenallowance.io/">
          here
        </a>
      </article>
    </Modal>

    <Modal
      title={`You don't have enought WETH, click "Wrap" to convert ETH`}
      visible={activeModal === 'WrapModal'}
      onCancel={() => dispatch(setUiState('activeModal', ''))}
      footer={[
        <Button key="cancel" onClick={() => dispatch(setUiState('activeModal', ''))} type="default">Cancel</Button>,
        <Button
          key="ok"
          onClick={() => {
            dispatch(change('WrapForm', 'amount', wrapAmount));
            dispatch(callContract('deposit'));
          }}
          type="primary"
        >
          Wrap
        </Button>,
      ]}
    >
      <article>You'll be able create the order after you convert ETH to WETH</article>
      <br />
      <article>Click on wrap to convert required amount</article>
      <br />
      <article>You can read about WETH in more details {' '}
        <a rel="noopener noreferrer" target="_blank" href="https://weth.io/">
          here
        </a>
      </article>
    </Modal>

    <Modal
      title="You've created a new transaction"
      visible={activeModal === 'TxModal'}
      onCancel={() => dispatch(setUiState('activeModal', ''))}
      footer={[
        <Button key="cancel" onClick={() => dispatch(setUiState('activeModal', ''))} type="default">Cancel</Button>,
        <Button key="ok" onClick={() => dispatch(setUiState('activeModal', ''))} type="primary">Continue</Button>,
      ]}
    >
      <article>
        You can track progress of transaction here
      </article>
      <br />
      <a style={{ wordWrap: 'break-word' }} rel="noopener noreferrer" target="_blank" href={`https://etherscan.io/tx/${txHash}`}>
        https://etherscan.io/tx/{txHash}
      </a>
    </Modal>
  </div>
);

const mapStateToProps = (state) => {
  const {
    activeModal,
    txHash,
    wrapAmount,
    activeTab,
  } = state.ui;

  const token = activeTab === 'buy' ? getCurrentPair(state) : getCurrentToken(state);
  return {
    activeModal,
    txHash,
    wrapAmount,
    token,
  };
};

export default connect(mapStateToProps)(ModalWrapper);
