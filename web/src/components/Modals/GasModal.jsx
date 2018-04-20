// @flow

import React from 'react';
import {
  Modal,
  Button,
  Form,
  Alert,
} from 'antd';
import { AntNumberInput } from 'components/ReduxFormComponents';
import {
  Field,
  reduxForm,
} from 'redux-form';
import {
  connect,
} from 'react-redux';
import {
  compose,
} from 'redux';
import {
  lifecycle,
} from 'recompose';

const enchance = lifecycle({
  componentWillMount() {
    window.web3Instance.eth.getGasPrice().then((gasPriceWei) => {
      const gasPrice = window.web3Instance.utils.fromWei(gasPriceWei, 'gwei');
      this.setState({ gasPrice });
    });
  },
});

type Props = {
  activeModal: string,
  onOk: Function,
  onCancel: Function,
  isTxLoading: boolean,
};

const GasModal = ({
  activeModal,
  onOk,
  onCancel,
  isTxLoading,
}: Props) => (
  <Modal
    destroyOnClose
    title="Gas settings"
    visible={activeModal === 'GasModal'}
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
          onCancel();
        }}
        loading={isTxLoading}
        type="primary"
      >
        Continue
      </Button>,
    ]}
  >
    <Alert
      message="You can increase gas price for faster confirmation"
      description={
        <article>
          Find best gas price on {' '}
          <a
            style={{ wordWrap: 'break-word', color: '#00bcd4' }}
            rel="noopener noreferrer"
            target="_blank"
            href="https://ethgasstation.info"
          >
          ethgasstation.info
          </a>
        </article>}
      type="info"
    />
    <Form style={{ marginTop: 25 }}>
      <Field
        id="gasPrice"
        name="gasPrice"
        component={AntNumberInput}
        label="Gas Price"
        addonAfter="Gwei"
      />
      <Field
        id="gasLimit"
        name="gasLimit"
        component={AntNumberInput}
        label="Gas Limit"
        addonAfter="Gwei"
      />
    </Form>
  </Modal>
);

const mapStateToProps = (state, props) => ({
  initialValues: {
    gasPrice: props.gasPrice,
    gasLimit: '100000',
  },
});

export default compose(
  enchance,
  connect(
    mapStateToProps,
  ),
  reduxForm({
    form: 'GasForm',
    touchOnChange: true,
    enableReinitialize: true,
    destroyOnUnmount: true,
  }),
)(GasModal);
