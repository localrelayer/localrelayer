// @flow
import React from 'react';
import {
  Alert,
  Input,
  Modal,
} from 'antd';

import * as S from './styled';

const GasModal = () => (
  <Modal
    title="Gas Settings"
    visible
    okText="Continue"
  >
    <Alert
      type="info"
      message="You can increase gas price for faster confirmation"
      description={(
        <S.AlertDescription>
            Find best gas price on
          {' '}
          <S.AlertLink
            href="https://ethgasstation.info"
          >
              ethgasstation.info
          </S.AlertLink>
        </S.AlertDescription>
)}
    />
    <S.GasForm>
      <S.GasForm.Item
        label="Gas Price:"
      >
        <Input
          placeholder="30"
          addonAfter={<div>Gwei</div>}
        />
      </S.GasForm.Item>
      <S.GasForm.Item
        label="Gas Limit:"
      >
        <Input
          placeholder="100000"
          addonAfter={<div>Gwei</div>}
        />
      </S.GasForm.Item>
    </S.GasForm>
  </Modal>
);

export default GasModal;
