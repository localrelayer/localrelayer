// @flow
import React, {
  useState,
  createElement,
} from 'react';
import {
  Modal,
  Steps,
} from 'antd';
import * as S from './styled';
import Overview from './steps/Overview';
import Wallet from './steps/Wallet';
import Deposit from './steps/Deposit';
import Trading from './steps/Trading';

type Props = {
  isSetupGuideVisible: boolean,
  toggleTutorialVisible: Function,
}

const steps = [
  Overview,
  Wallet,
  Deposit,
  Trading,
];

const Tutorial = (props: Props) => {
  const [step, setStep] = useState(0);
  const {
    isSetupGuideVisible,
    toggleTutorialVisible,
  } = props;

  return (
    <Modal
      visible={isSetupGuideVisible}
      footer={null}
      afterClose={() => {
        setStep(0);
      }}
      width={800}
      onCancel={() => toggleTutorialVisible()}
    >
      <S.Container>
        <S.Navigation>
          <S.NavTitle>Setup Guide</S.NavTitle>
          <Steps current={step} direction="vertical">
            <Steps.Step
              onClick={() => setStep(0)}
              title={<S.Title>Overview</S.Title>}
              description={(
                <S.NavText>
                  Learn the steps to start trading on Instex.
                </S.NavText>)}
            />
            <Steps.Step
              onClick={() => setStep(1)}
              title={<S.Title>Connect Wallet</S.Title>}
              description={(
                <S.NavText>
                  No signup. Connect and trade directly from your wallet.
                </S.NavText>)}
            />
            <Steps.Step
              onClick={() => setStep(2)}
              title={<S.Title>Deposit ETH</S.Title>}
              description={(
                <S.NavText>
                  ETH needs to be deposited(wrapped) to trade with ERC20 tokens.
                </S.NavText>)}
            />
            <Steps.Step
              onClick={() => setStep(3)}
              title={<S.Title>Enable Trading</S.Title>}
              description={(
                <S.NavText>
                  Enable tokens for trading on the blockchain.
                </S.NavText>)}
            />
          </Steps>
        </S.Navigation>
        <S.Content>
          {createElement(steps[step], {
            ...props,
            nextStep: () => {
              setStep(step + 1);
            },
            closeTutorial: () => {
              toggleTutorialVisible();
            },
          })}

        </S.Content>
      </S.Container>
    </Modal>
  );
};


export default Tutorial;
