// @flow
import React from 'react';
import * as S from './styled';

type Props = {
  type: String,
}

const BuySellForm = ({ type }: Props) => (
  <S.BuySellForm layout="vertical" onSubmit="">
    <S.BuySellForm.Item
      label={(
        <S.FormItemTitle>
          <div>Price</div>
          <S.FormItemTitleLinks>
            <a>Buy</a>
            <a>Sell</a>
          </S.FormItemTitleLinks>
        </S.FormItemTitle>
    )}
    >
      <S.FormInput
        placeholder="WETH"
        addonAfter={<div>WETH</div>}
      />
    </S.BuySellForm.Item>
    <S.BuySellForm.Item
      label={(
        <S.FormItemTitle>
          <div>Amount</div>
          <S.FormItemTitleLinks>
            <a>25%</a>
            <a>50%</a>
            <a>75%</a>
            <a>100%</a>
          </S.FormItemTitleLinks>
        </S.FormItemTitle>
    )}
    >
      <S.FormInput
        placeholder="ZRX"
        addonAfter={<div>ZRX</div>}
      />
    </S.BuySellForm.Item>
    <S.AdditionalInfo>
      <div>
        Total: 0.00001 WETH
      </div>
      <div>
        Fee: 0.000000
        {' '}
        {type === 'buy' ? 'ZRX' : 'WETH'}
        <S.AdditionalInfoPopover
          placement="bottom"
          content={(
            <div>
              <div>Ethereum tx fee: 0.000001 ZRX</div>
              <div>Instex fee: 0.000000 ZRX</div>
            </div>
          )}
        >
          <S.AdditionalInfoIcon type="info-circle-o" />
        </S.AdditionalInfoPopover>
      </div>
    </S.AdditionalInfo>
    <S.SubmitButton type="primary">
      {type === 'buy' ? 'Buy' : 'Sell'}
      {' '}
      ZRX
    </S.SubmitButton>
  </S.BuySellForm>
);

export default BuySellForm;
