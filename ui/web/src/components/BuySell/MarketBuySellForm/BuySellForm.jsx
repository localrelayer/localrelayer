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
import {
  utils,
} from 'instex-core';
import * as S from './styled';

type Props = {
  type: String,
  baseSymbol: String,
  quoteSymbol: String,
  onSubmitOrder: Function,
  currentBalance: String,
  currentBuySellTab: String,
  currentOrder: Object,
  minAmount: String,
  maxAmount: String,
  setMarketAmount: Function,
  matchedMarketOrders: any,
}

const truncate = (value, n) => Math.floor(value * (10 ** n)) / (10 ** n);

const setFieldByPercentage = (
  setValues,
  values,
  currentBalance,
  setMarketAmount,
  setFieldTouched,
  percentage = 100,
) => {
  const amount = truncate(new BigNumber(currentBalance).times(percentage / 100), 8);
  setMarketAmount(amount);
  setFieldTouched('amount', true, true);
  setValues(
    {
      ...values,
      amount,
    },
  );
};

const BuySellForm = ({
  type,
  baseSymbol,
  quoteSymbol,
  onSubmitOrder,
  currentBalance,
  currentBuySellTab,
  currentOrder,
  minAmount,
  maxAmount,
  setMarketAmount,
  matchedMarketOrders,
}: Props) => (
  <Formik
    isInitialValid
    initialValues={
      {
        ...currentOrder,
      }}
    validateOnBlur={false}
    enableReinitialize
    validateOnChange
    onSubmit={(values, actions) => (
      onSubmitOrder(actions)
    )}
    validate={(values) => {
      const errors = {};
      if (!values.amount) {
        errors.amount = 'Required';
      } else if (!utils.isNumber(values.amount)) {
        errors.amount = 'Amount should be a number';
      } else if (new BigNumber(matchedMarketOrders.ordersTotal).eq(0)) {
        errors.balance = 'No matched orders';
      } else if (new BigNumber(values.amount).gt(matchedMarketOrders.ordersAmount)) {
        errors.balance = `Max amount is ${matchedMarketOrders.ordersAmount}`;
      }
      if (
        currentBuySellTab === 'bidMarket'
        && utils.isNumber(values.amount)
      ) {
        if (new BigNumber(matchedMarketOrders.ordersTotal).gt(currentBalance)) {
          errors.balance = 'Insufficient balance';
        }
        if (new BigNumber(matchedMarketOrders.ordersTotal).lt(minAmount)) {
          errors.balance = 'Too low amount';
        }
        if (new BigNumber(matchedMarketOrders.ordersTotal).gt(maxAmount)) {
          errors.balance = 'Too high amount';
        }
      } else if (
        currentBuySellTab === 'askMarket'
        && utils.isNumber(values.amount)
      ) {
        if (+currentBalance < +values.amount) {
          errors.balance = 'Insufficient balance';
        }
        if (new BigNumber(values.amount).lt(minAmount)) {
          errors.balance = 'Too low amount';
        }
        if (new BigNumber(values.amount).gt(maxAmount)) {
          errors.balance = 'Too high amount';
        }
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
      setValues,
    }) => (
      <S.BuySellForm
        layout="vertical"
        onSubmit={(e) => {
          handleSubmit(e);
          setFieldTouched('amount', true, true);
        }}
        buttonvalue={type === 'bid' ? 'Buy' : 'Sell'}
      >
        <S.BuySellForm.Item
          validateStatus={touched.amount && errors.amount && 'error'}
          help={touched.amount && errors.amount}
          label={(
            <S.FormItemTitle>
              <div>Amount</div>
              <S.FormItemTitleLinks>
                <a
                  onClick={() => setFieldByPercentage(
                    setValues,
                    values,
                    currentBalance,
                    setMarketAmount,
                    setFieldTouched,
                    25,
                  )}
                >
                  25%
                </a>
                <a
                  onClick={() => setFieldByPercentage(
                    setValues,
                    values,
                    currentBalance,
                    setMarketAmount,
                    setFieldTouched,
                    50,
                  )}
                >
                  50%
                </a>
                <a
                  onClick={() => setFieldByPercentage(
                    setValues,
                    values,
                    currentBalance,
                    setMarketAmount,
                    setFieldTouched,
                    75,
                  )}
                >
                  75%
                </a>
                <a
                  onClick={() => setFieldByPercentage(
                    setValues,
                    values,
                    currentBalance,
                    setMarketAmount,
                    setFieldTouched,
                    100,
                  )}
                >
                  100%
                </a>
              </S.FormItemTitleLinks>
            </S.FormItemTitle>
          )}
        >
          <S.FormInput
            name="amount"
            placeholder="0.00000000"
            value={values.amount}
            addonAfter={(
              <div>
                {baseSymbol}
              </div>
            )}
            onChange={(e) => {
              handleChange(e);
              setFieldTouched('amount', true, true);
              setMarketAmount(e.target.value);
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
              {matchedMarketOrders.ordersTotal}
              {' '}
              {quoteSymbol}
            </div>
            <div>
              Fee: 0.000000
              {' '}
              {baseSymbol}
            </div>
          </S.AdditionalInfo>
          <S.SubmitButton
            type="primary"
            htmlType="submit"
            disabled={!isValid && !isSubmitting}
          >
            <span style={{ marginRight: '5px' }}>
              {
                type === 'bid'
                  ? (
                    'Buy'
                  )
                  : (
                    'Sell'
                  )
              }
            </span>
            {baseSymbol}
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
