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
};

export default ({
  activeModal,
  onOk,
  onCancel,
}: Props) => (
  <Modal
    title={'You don\'t have enought WETH, click "Wrap" to convert ETH'}
    visible={activeModal === 'WrapModal'}
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
        onClick={onOk}
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
    <article>
        You can read about WETH in more details{' '}
      <a rel="noopener noreferrer" target="_blank" href="https://weth.io/">
          here
      </a>
    </article>
  </Modal>
);
