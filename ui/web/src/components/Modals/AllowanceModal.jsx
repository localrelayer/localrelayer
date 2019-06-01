// @flow

import React from 'react';
import {
  Modal,
  Button,
} from 'antd';
import type { Token } from 'localrelayer-core/types';


type Props = {
  activeModal: string,
  onOk: Function,
  onCancel: Function,
  token: Token,
};

export default ({
  activeModal,
  onOk,
  onCancel,
  token,
}: Props) => (
  <Modal
    title={`You need to enable "${token.name}" trading`}
    visible={activeModal === 'AllowanceModal'}
    destroyOnClose
    onCancel={onCancel}
    onOk={onOk}
    footer={[
      <Button key="cancel" onClick={onCancel} type="default">
        Cancel
      </Button>,
      <Button
        key="ok"
        onClick={() => {
          onOk();
        }}
        type="primary"
      >
        Continue
      </Button>,
    ]}
  >
    <article>You'll be able create the order after you allow the token trading</article>
    <br />
    <article>
    Setting this allowance does not mean you are giving your tokens to the 3rd party. All it
    means is you are willingly allowing the Smart Contract to transfer on your behalf.
    </article>
    <br />
    <article>
    You can read about allowance in more details{' '}
      <a rel="noopener noreferrer" target="_blank" href="https://tokenallowance.io/">
      here
      </a>
    </article>
  </Modal>
);
