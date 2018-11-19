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

/* Why so much indexes? WTF? */
const orderSchema = mongoose.Schema({
  makerAddress: { type: String, index: true },
  takerAddress: { type: String, index: true },
  feeRecipientAddress: { type: String, index: true },
  senderAddress: { type: String, index: true },
  makerAssetAmount: { type: String },
  takerAssetAmount: { type: String },
  makerFee: { type: String },
  takerFee: { type: String },
  makerAssetData: { type: String, index: true },
  takerAssetData: { type: String, index: true },
  orderHash: { type: String, index: true, unique: true, dropDups: true },
  expirationTimeSeconds: { type: String },
  networkId: { type: Number, index: true },
  salt: { type: String },
  exchangeAddress: { type: String },
  signature: { type: String },
  makerAssetProxyId: { type: String, index: true },
  takerAssetProxyId: { type: String, index: true },
  makerAssetAddress: { type: String, index: true },
  takerAssetAddress: { type: String, index: true },
  isValid: { type: Boolean },
  error: { type: String },
  remainingFillableMakerAssetAmount: { type: String, index: true },
  remainingFillableTakerAssetAmount: { type: String, index: true },
  completedAt: { type: Date, index: true },
}, { versionKey: false });

const assetDataSchema = mongoose.Schema({
  minAmount: { type: String, index: true },
  maxAmount: { type: String, index: true },
  precision: { type: Number },
  assetData: { type: String, index: true },
});
const assetPairsSchema = mongoose.Schema({
  assetDataA: assetDataSchema,
  assetDataB: assetDataSchema,
  networkId: { type: Number },
}, { versionKey: false });
// orderSchema.index({ logIndex: 1, transactionHash: 1 }, { unique: true });

export const Order = mongoose.model('Order', orderSchema);
export const AssetPair = mongoose.model('AssetPair', assetPairsSchema);
