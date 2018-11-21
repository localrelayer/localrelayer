// @flow
import React from 'react';
import {
  Formik,
} from 'formik';
import {
  BigNumber,
} from '0x.js';
import {
  Icon,
} from 'antd';
import * as S from './styled';

type Props = {
  type: String,
  onSubmitOrder: Function,
  currentBalance: String,
  currentBuySellTab: String,
}

const isNumber = n => !isNaN(+n) && +n !== 0 && isFinite(n); /* eslint-disable-line */

const BuySellForm = ({
  type,
  onSubmitOrder,
  currentBalance,
  currentBuySellTab,
}: Props) => (
  <Formik
    isInitialValid
    validateOnBlur={false}
    validateOnChange
    onSubmit={(values, actions) => (
      onSubmitOrder({
        ...values,
        formActions: actions,
        type,
      })
    )}
    validate={(values) => {
      const errors = {};
      if (!values.amount) {
        errors.amount = 'Required';
      } else if (!isNumber(values.amount)) {
        errors.amount = 'Amount should be a number';
      }
      if (!values.price) {
        errors.price = 'Required';
      } else if (!isNumber(values.price)) {
        errors.price = 'Amount should be a number';
      }
      if (currentBuySellTab === 'buy'
        && isNumber(values.amount)
        && isNumber(values.price)
        && currentBalance < new BigNumber(values.amount).times(values.price).toNumber()) {
        errors.balance = 'Insufficient balance';
      } else if (currentBuySellTab === 'sell'
        && isNumber(values.amount)
        && isNumber(values.price)
        && +currentBalance < +values.amount) {
        errors.balance = 'Insufficient balance';
      }
      return errors;
    }}
  >
    {({
      handleChange,
      values,
      errors,
      isValid,
      touched,
      isSubmitting,
      handleSubmit,
      handleBlur,
      setFieldTouched,
    }) => (
      <S.BuySellForm
        layout="vertical"
        onSubmit={(e) => {
          handleSubmit(e);
          setFieldTouched('price', true, true);
          setFieldTouched('amount', true, true);
        }}
        buttonvalue={type === 'buy' ? 'Buy' : 'Sell'}
      >
        <S.BuySellForm.Item
          validateStatus={touched.price && errors.price && 'error'}
          help={touched.price && errors.price}
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
            placeholder="0.000000"
            name="price"
            value={values.price}
            addonAfter={<div>WETH</div>}
            onChange={(e) => {
              handleChange(e);
              setFieldTouched('price', true, true);
            }}
            onBlur={handleBlur}
            autoComplete="off"
          />
        </S.BuySellForm.Item>
        <S.BuySellForm.Item
          validateStatus={touched.amount && errors.amount && 'error'}
          help={touched.amount && errors.amount}
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
            name="amount"
            placeholder="0.000000"
            value={values.amount}
            addonAfter={<div>ZRX</div>}
            onChange={(e) => {
              handleChange(e);
              setFieldTouched('amount', true, true);
            }}
            autoComplete="off"
            onBlur={handleBlur}
          />
        </S.BuySellForm.Item>
        <S.BuySellForm.Item
          validateStatus={touched.amount && errors.balance && 'error'}
          help={touched.amount && errors.balance}
        >
          <S.AdditionalInfo>
            <div>
              Total:
              {' '}
              {isNumber(values.amount) && isNumber(values.price) && isValid
                ? new BigNumber(values.amount).times(values.price).toFixed(6)
                : '0.000000'
              }
              {' '}
              WETH
            </div>
            <div>
              Fee: 0.000000
              {' '}
              ZRX
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
          <S.SubmitButton
            type="primary"
            htmlType="submit"
            disabled={!isValid && !isSubmitting}
          >
            {type === 'buy' ? 'Buy' : 'Sell'}
            {' '}
            ZRX
            {isSubmitting
              ? (
                <Icon
                  spin
                  type="loading"
                  style={{ fontSize: 16 }}
                />
              )
              : ''
            }
          </S.SubmitButton>
        </S.BuySellForm.Item>
      </S.BuySellForm>
    )}
  </Formik>
);

export default BuySellForm;
