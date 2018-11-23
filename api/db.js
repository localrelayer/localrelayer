const mongoose = require('mongoose');
const config = require('./config');

mongoose.Promise = global.Promise;

mongoose.connect(
  config.mongo,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
  },
);

const orderSchema = mongoose.Schema({
  makerAddress: { type: String },
  takerAddress: { type: String },
  feeRecipientAddress: { type: String },
  senderAddress: { type: String },
  makerAssetAmount: { type: String },
  takerAssetAmount: { type: String },
  makerFee: { type: String },
  takerFee: { type: String },
  makerAssetData: { type: String },
  takerAssetData: { type: String },
  orderHash: { type: String, unique: true, dropDups: true },
  expirationTimeSeconds: { type: String },
  networkId: { type: Number, index: true },
  salt: { type: String },
  exchangeAddress: { type: String },
  signature: { type: String },
  makerAssetProxyId: { type: String },
  takerAssetProxyId: { type: String },
  makerAssetAddress: { type: String },
  takerAssetAddress: { type: String },
  isValid: { type: Boolean },
  isShadowed: { type: Boolean },
  error: { type: String },
  remainingFillableMakerAssetAmount: { type: String },
  remainingFillableTakerAssetAmount: { type: String },
  completedAt: { type: Date },
}, { versionKey: false });

const assetDataSchema = mongoose.Schema({
  minAmount: {
    type: String,
  },
  maxAmount: {
    type: String,
  },
  precision: {
    type: Number,
  },
  assetData: {
    type: String,
  },
});
const assetPairsSchema = mongoose.Schema({
  assetDataA: assetDataSchema,
  assetDataB: assetDataSchema,
  networkId: {
    type: Number,
  },
}, {
  versionKey: false,
});

export const Order = mongoose.model('Order', orderSchema);
export const AssetPair = mongoose.model('AssetPair', assetPairsSchema);
