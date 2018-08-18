// @flow

import React from 'react';
import {
  Modal,
  Button,
} from 'antd';


type Props = {
  activeModal: string,
  onOk: Function,
  onCancel: Function,
  txHash: string,
  isTxLoading: boolean,
};

export default ({
  activeModal,
  onOk,
  onCancel,
  txHash,
  isTxLoading,
}: Props) => (

  <Modal
    title="You've created a new transaction"
    visible={activeModal === 'TxModal'}
    onCancel={onCancel}
    footer={[
      <Button
        key="cancel"
        onClick={onCancel}
        type="default"
      >
      Cancel
      </Button>,
      <Button
        key="ok"
        loading={isTxLoading}
        onClick={() => {
          onOk();
          onCancel();
        }}
        type="primary"
      >
      Continue
      </Button>,
  ]}
  >
    <article>
    You can track progress of transaction here (sometimes transactions shows up in a few
    minutes, don't worry)
    </article>
    <br />
    <article>
    As soon as transaction will be mined, you can continue.
    </article>
    <br />
    <a
      style={{ wordWrap: 'break-word' }}
      rel="noopener noreferrer"
      target="_blank"
      href={`https://etherscan.io/tx/${txHash}`}
    >
    https://etherscan.io/tx/{txHash}
    </a>
  </Modal>
);
