// @flow

import React from 'react';
import {
  Table,
  Tooltip,
  Icon,
  Switch,
} from 'antd';
import * as S from '../styled';

const getColumns = onToggleTradable => [
  {
    title: 'Token',
    dataIndex: 'symbol',
    render: (text, record) => (
      <div>
        <Tooltip title={record.name}>
          {text}
        </Tooltip>
      </div>
    ),
  },
  {
    title: 'Tradable',
    key: 'tradable',
    render: (text, record) => (
      record.isTradablePending
        ? (
          <Icon type="loading" />
        ) : (
          <Switch
            checked={record.isTradable}
            checkedChildren={(
              <Icon type="check" />
            )}
            onChange={(checked) => {
              onToggleTradable(checked, record);
            }}
          />
        )
    ),
  },
];

const Trading = ({
  closeTutorial,
  onToggleTradable,
  assets,
}: Props) => (
  <S.StepWrapper>
    <S.Title>Enable Trading</S.Title>
    <S.Body>
      <Table
        pagination={false}
        rowKey="address"
        dataSource={assets}
        scroll={{ y: 150 }}
        columns={
        getColumns(
          onToggleTradable,
        )}
      />
      <S.Text>
        Enable tokens to be tradable. This will allow you to trade tokens directly from your wallet.
      </S.Text>
    </S.Body>
    <S.NextButton onClick={closeTutorial}>
      Finish
    </S.NextButton>
  </S.StepWrapper>
);

export default Trading;
