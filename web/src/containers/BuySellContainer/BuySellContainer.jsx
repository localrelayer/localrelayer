import React from 'react';
import { connect } from 'react-redux';
import {
  createOrder as createOrderAction,
} from 'instex-core/actions';
import BuySell from '../../components/BuySell';
import { StyleContainer } from './styled';

type Props = {
  createOrder: Function
}

const BuySellContainer = ({ createOrder }: Props) => (
  <StyleContainer>
    <BuySell onSubmit={createOrder} />
  </StyleContainer>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  createOrder: createOrderAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(BuySellContainer);
