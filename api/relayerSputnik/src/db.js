const mongoose = require('mongoose');
const config = require('../config');

mongoose.Promise = global.Promise;

mongoose.connect(config.mongo);

mongoose.connection.on('connected', () => {
  console.log('database connection established');
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});

mongoose.connection.on('disconnected', () => {
  console.log('database connection terminated');
});

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
  completedAt: { type: Date },
  networkId: { type: Number, index: true },
}, { versionKey: false });

// orderSchema.index({ logIndex: 1, transactionHash: 1 }, { unique: true });

export const Order = mongoose.model('Order', orderSchema);
