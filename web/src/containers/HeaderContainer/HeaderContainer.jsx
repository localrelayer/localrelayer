// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import {
  push,
} from 'react-router-redux';
import {
  getFormValues,
  isValid,
} from 'redux-form';
import type {
  Dispatch,
} from 'redux';
import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  User,
  Tokens,
  Token,
} from 'instex-core/types';

import {
  setUiState,
  setAddress,
  changeProvider,
} from 'instex-core/actions';
import {
  getFilteredTokens,
  getCurrentPair,
  getCurrentToken,
} from 'instex-core/selectors';

import {
  Header,
} from 'components';


type Props = {
  user: User,
  tokens: Tokens,
  selectedToken: Token,
  tokenPair: Token,
  dispatch: Dispatch<*>,
  customTokenAddress: string,
  isCustomTokenFormValid: Boolean,
  location: Object,
};

const HeaderContainer: StatelessFunctionalComponent<Props> =
  ({
    user,
    tokens,
    selectedToken,
    tokenPair,
    dispatch,
    customTokenAddress,
    isCustomTokenFormValid,
    location,
  }: Props): Node =>
    <Header
      user={user}
      tokens={tokens}
      tokenPair={tokenPair}
      selectedToken={selectedToken}
      isCustomTokenFormValid={isCustomTokenFormValid}
      onTokenSelect={
        symbol =>
          dispatch(
            push(`${symbol}-${tokenPair.symbol}`),
          )
      }
      onPairSelect={
        symbol =>
          dispatch(
            push(`${selectedToken.symbol}-${symbol}`),
          )
      }
      onTokenSearch={
        query =>
          dispatch(
            setUiState('searchQuery', query),
          )
      }
      onHelpClick={
        () =>
          dispatch(
            setUiState('shouldRunTutorial', true),
          )
      }
      setTokenAddress={
        () =>
          customTokenAddress && dispatch(
            push(`${customTokenAddress}-${tokenPair.symbol}`),
          )
      }
      location={location}
      onAddressSelect={
        address =>
        dispatch(
          setAddress(address),
        )
      }
      onProviderSelect={provider => dispatch(changeProvider(provider))}
    />;

const mapStateToProps = (state) => {
  const { address: customTokenAddress = '' } = getFormValues('CustomTokenForm')(state) || {};
  const isCustomTokenFormValid = isValid('CustomTokenForm')(state);
  return {
    location: state.router.location,
    tokens: getFilteredTokens(state),
    user: state.profile,
    selectedToken: getCurrentToken(state),
    tokenPair: getCurrentPair(state),
    customTokenAddress,
    isCustomTokenFormValid,
  };
};

export default connect(mapStateToProps)(HeaderContainer);
