// The deployed addresses from the Ganache snapshot
export const GANACHE_CONTRACT_ADDRESSES = {
  exchange: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
  erc20Proxy: '0x1dc4c1cefef38a777b15aa20260a54e584b16c48',
  erc721Proxy: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
  zrxToken: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
  etherToken: '0x0b1ba0af832d7c05fd64161e0db78e85978e8082',
  assetProxyOwner: '0x34d402f14d58e001d8efbe6585051bf9706aa064',
  forwarder: '0xb69e673309512a9d726f87304c6984054f87a93b',
  orderValidator: '0xe86bb98fcf9bff3512c74589b78fb168200cc546',
};

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ETH_NETWORKS_NAME_MAP = {
  main: 1,
  kovan: 42,
  test: 50,
};

/* Order fields which required for 0x protocol */
export const ORDER_FIELDS = [
  'makerAddress',
  'takerAddress',
  'senderAddress',
  'feeRecipientAddress',
  'exchangeAddress',
  'makerAssetAmount',
  'takerAssetAmount',
  'makerFee',
  'takerFee',
  'makerAssetData',
  'takerAssetData',
  'salt',
  'expirationTimeSeconds',
  'signature',
];

export const ORDER_META_FIELDS = [
  'isValid',
  'isShadowed',
  'remainingFillableMakerAssetAmount',
  'remainingFillableTakerAssetAmount',
  'filledTakerAssetAmount',
  'networkId',
  'orderHash',
  'createdAt',
  'completedAt',
  'error',
];
