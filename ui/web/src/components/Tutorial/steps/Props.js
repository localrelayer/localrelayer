// @flow

export type Props = {
  isWeb3ProviderPresent: boolean,
  selectedAccount: String,
  networkName: String,
  balance: String,
  isSetupGuideVisible: boolean,
  toggleTutorialVisible: Function,
  nextStep: Function,
  closeTutorial: Function
};
