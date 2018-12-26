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
  makerAddress: {
    type: String,
  },
  takerAddress: {
    type: String,
  },
  feeRecipientAddress: {
    type: String,
  },
  senderAddress: {
    type: String,
  },
  makerAssetAmount: {
    type: String,
  },
  takerAssetAmount: {
    type: String,
  },
  makerFee: {
    type: String,
  },
  takerFee: {
    type: String,
  },
  makerAssetData: {
    type: String,
  },
  takerAssetData: {
    type: String,
  },
  orderHash: {
    type: String,
    unique: true,
    dropDups: true,
  },
  expirationTimeSeconds: {
    type: String,
  },
  networkId: {
    type: Number,
    index: true,
  },
  salt: {
    type: String,
  },
  exchangeAddress: {
    type: String,
  },
  signature: {
    type: String,
  },
  makerAssetProxyId: {
    type: String,
  },
  takerAssetProxyId: {
    type: String,
  },
  makerAssetAddress: {
    type: String,
  },
  takerAssetAddress: {
    type: String,
  },
  isValid: {
    type: Boolean,
    index: true,
  },
  isShadowed: {
    type: Boolean,
    index: true,
  },
  error: {
    type: String,
  },
  sourceRelayer: {
    type: String,
    index: true,
  },
  remainingFillableMakerAssetAmount: {
    type: String,
  },
  remainingFillableTakerAssetAmount: {
    type: String,
  },
  filledTakerAssetAmount: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  lastFilledAt: {
    type: Date,
  },
}, {
  versionKey: false,
});
orderSchema.index({
  makerAssetData: 1,
  takerAssetData: -1,
});
orderSchema.index({
  isValid: 1,
  isShadowed: -1,
});

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

const assetPairSchema = mongoose.Schema({
  assetDataA: assetDataSchema,
  assetDataB: assetDataSchema,
  networkId: {
    type: Number,
    index: true,
  },
}, {
  versionKey: false,
});
assetPairSchema.index({
  assetDataA: 1,
  assetDataB: -1,
  networkId: -1,
}, {
  unique: true,
});

const transactionSchema = mongoose.Schema({
  transactionHash: {
    unique: true,
    dropDups: true,
    type: String,
  },
  address: {
    type: String,
  },
  name: {
    type: String,
  },
  blockHash: {
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  gasUsed: {
    type: Number,
  },
  cumulativeGasUsed: {
    type: Number,
  },
  status: {
    type: Number,
  },
  networkId: {
    type: Number,
  },
  meta: {
    type: Object,
  },
  createdAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
}, {
  versionKey: false,
});

export const Order = mongoose.model('Order', orderSchema);
export const AssetPair = mongoose.model('AssetPair', assetPairSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
