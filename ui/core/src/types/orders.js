// @flow


export type Order = {
  id: string,
  makerAddress: string,
  takerAddress: string,
  feeRecipientAddress: string,
  senderAddress: string,
  makerAssetAmount: string,
  takerAssetAmount: string,
  makerFee: string,
  takerFee: string,
  expirationTimeSeconds: string,
  salt: string,
  makerAssetData: string,
  takerAssetData: string,
  exchangeAddress: string,
  signature: string,
};
