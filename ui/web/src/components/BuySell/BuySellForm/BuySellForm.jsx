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
  bestOrders: Object,
}

const isNumber = n => !isNaN(+n) && +n !== 0 && isFinite(n) && Math.abs(n) === +n; /* eslint-disable-line */

const truncate = (value, n) => Math.floor(value * (10 ** n)) / (10 ** n);

const setFieldByPercentage = (
  type,
  setValues,
  values,
  currentBalance,
  percentage = 100,
) => {
  const bidAmount = values.price
    ? truncate(new BigNumber(currentBalance).times(percentage / 100).div(values.price), 8)
    : '0.00000000';
  setValues(
    {
      ...values,
      amount: type === 'ask'
        ? truncate(new BigNumber(currentBalance).times(percentage / 100), 8)
        : bidAmount,
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
  bestOrders,
}: Props) => (
  <Formik
    isInitialValid
    initialValues={
      {
        ...currentOrder,
        expirationNumber: 1,
        expirationUnit: 'hours',
      }}
    validateOnBlur={false}
    enableReinitialize
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
      if (!values.expirationNumber) {
        errors.expirationNumber = 'Required';
      } else if (
        !utils.validateExpiration(
          values.expirationNumber,
          values.expirationUnit,
        )
          .status) {
        errors.expirationNumber = utils.validateExpiration(
          values.expirationNumber,
          values.expirationUnit,
        )
          .error;
      }
      if (currentBuySellTab === 'bid'
        && isNumber(values.amount)
        && isNumber(values.price)
        && currentBalance < new BigNumber(values.amount).times(values.price).toNumber()) {
        errors.balance = 'Insufficient balance';
      } else if (currentBuySellTab === 'ask'
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
      setValues,
    }) => (
      <S.BuySellForm
        layout="vertical"
        onSubmit={(e) => {
          handleSubmit(e);
          setFieldTouched('price', true, true);
          setFieldTouched('amount', true, true);
          setFieldTouched('expirationNumber', true, true);
        }}
        buttonvalue={type === 'bid' ? 'Buy' : 'Sell'}
      >
        <S.BuySellForm.Item
          validateStatus={touched.price && errors.price && 'error'}
          help={touched.price && errors.price}
          label={(
            <S.FormItemTitle>
              <div>Price</div>
              <S.FormItemTitleLinks>
                <a
                  onClick={
                    () => setValues(
                      { ...values,
                        price: bestOrders.ask?.price || '0.00000000' },
                    )
                  }
                >
                  Buy
                </a>
                <a
                  onClick={
                    () => setValues(
                      { ...values,
                        price: bestOrders.bid?.price || '0.00000000' },
                    )
                  }
                >
                  Sell
                </a>
              </S.FormItemTitleLinks>
            </S.FormItemTitle>
          )}
        >
          <S.FormInput
            placeholder="0.00000000"
            name="price"
            value={values.price}
            addonAfter={(
              <div>
                {quoteSymbol}
              </div>
            )}
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
                <a
                  onClick={() => setFieldByPercentage(type, setValues, values, currentBalance, 25)}
                >
                  25%
                </a>
                <a
                  onClick={() => setFieldByPercentage(type, setValues, values, currentBalance, 50)}
                >
                  50%
                </a>
                <a
                  onClick={() => setFieldByPercentage(type, setValues, values, currentBalance, 75)}
                >
                  75%
                </a>
                <a
                  onClick={() => setFieldByPercentage(type, setValues, values, currentBalance)}
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
            }}
            autoComplete="off"
            onBlur={handleBlur}
          />
        </S.BuySellForm.Item>
        <S.BuySellForm.Item
          label="Expiration"
          validateStatus={touched.expirationNumber && errors.expirationNumber && 'error'}
          help={touched.expirationNumber && errors.expirationNumber}
        >
          <S.ExpirationBlock>
            <S.ExpirationInput
              name="expirationNumber"
              value={values.expirationNumber}
              onChange={(e) => {
                handleChange(e);
                setFieldTouched('expirationNumber', true, true);
              }}
              onBlur={handleBlur}
              autoComplete="off"
            />
            <S.ExpirationSelect
              name="expirationUnit"
              value={values.expirationUnit}
              onChange={(value) => {
                setValues(
                  { ...values,
                    expirationUnit: value },
                );
              }}
            >
              <S.ExpirationSelect.Option value="minutes">minutes</S.ExpirationSelect.Option>
              <S.ExpirationSelect.Option value="hours">hours</S.ExpirationSelect.Option>
              <S.ExpirationSelect.Option value="days">days</S.ExpirationSelect.Option>
              <S.ExpirationSelect.Option value="months">months</S.ExpirationSelect.Option>
            </S.ExpirationSelect>
          </S.ExpirationBlock>
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
              {quoteSymbol}
            </div>
            <div>
              Fee: 0.000000
              {' '}
              {baseSymbol}
              <S.AdditionalInfoPopover
                placement="bottom"
                content={(
                  <div>
                    <div>
                      Ethereum tx fee: 0.000001
                      {baseSymbol}
                    </div>
                    <div>
                      Instex fee: 0.000000
                      {baseSymbol}
                    </div>
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
