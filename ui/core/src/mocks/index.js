import assetPairsJson from './assetPairs.json';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

/* https://github.com/Marak/faker.js/blob/master/lib/finance.js#L223 */
function randomEthereumAddress() {
  const hexadecimalSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  const randomHex = Array(40).fill().map(
    () => (
      hexadecimalSymbols[Math.floor(Math.random() * hexadecimalSymbols.length)]
    ),
  );
  return `0x${randomHex.join('')}`;
}

export function getAssetPairs({
  assetDataA,
  assetDataB,
  networkId = 1,
  page = 1,
  perPage = 100,
} = {
  networkId: 1,
  page: 1,
  perPage: 100,
}) {
  const records = assetPairsJson
    .slice((page - 1) * perPage)
    .slice(0, perPage)
    .filter(
      r => (
        (
          assetDataA
            ? r.assetDataA.assetData === assetDataA
            : true
        )
        && (
          assetDataB
            ? r.assetDataB.assetData === assetDataB
            : true
        )
      ),
    );

  return {
    total: assetPairsJson.length,
    network: networkId,
    total: assetPairsJson.length,
    page,
    perPage,
    records,
  };
}

export function mocksOrdersFactory({
  makerAssetData,
  takerAssetData,
  qty = {
    bids: 100,
    asks: 100,
  },
} = {
  qty: {
    bids: 100,
    asks: 100,
  },
}) {
  const assetPairs = getAssetPairs({
    assetDataA: makerAssetData,
    assetDataB: takerAssetData,
    // Just in case, to get all
    perPage: 10000,
  });
  function ordersIterator() {
    let {
      bids,
      asks,
    } = qty;
    return {
      next: () => {
        const pair = assetPairs.records[Math.floor(Math.random() * assetPairs.records.length)];
        const type = bids ? 'bid' : 'ask';
        if (bids) {
          bids -= 1;
        } else {
          asks -= 1;
        }
        return {
          value: {
            makerAddress: randomEthereumAddress(),
            takerAddress: NULL_ADDRESS,
            feeRecipientAddress: randomEthereumAddress(),
            senderAddress: randomEthereumAddress(),
            makerAssetAmount: '10000000000000000',
            takerAssetAmount: '20000000000000000',
            makerFee: '10000000000000000',
            takerFee: '20000000000000000',
            expirationTimeSeconds: '1532560590',
            salt: '1532559225',
            makerAssetData: type === 'bid' ? pair.assetDataA.assetData : pair.assetDataB.assetData,
            takerAssetData: type === 'bid' ? pair.assetDataB.assetData : pair.assetDataA.assetData,
            exchangeAddress: randomEthereumAddress(),
          },
          done: !bids && !asks,
        };
      },
    };
  }

  const ordersProvider = ordersIterator();
  const orders = Array(qty.bids + qty.asks).fill().map(() => ordersProvider.next().value);
  const bidsDescendingOrder = orders.map(item => item)
    .sort((a, b) => b.takerFee - a.takerFee);
  const asksAscendingOrder = orders.map(item => item)
    .sort((a, b) => a.takerFee - b.takerFee);

  return {
    getOrderBook({
      baseAssetData,
      quoteAssetData,
      page = 1,
      perPage = 100,
    } = {
      page: 1,
      perPage: 100,
    }) {
      return {
        bids: {
          total: qty.bids,
          page,
          perPage,
          records: bidsDescendingOrder
            .slice(0, qty.bids)
            .map(order => ({
              order,
              metaData: {},
            }))
            .filter(
              r => (
                (
                  baseAssetData
                    ? r.order.makerAssetData === baseAssetData
                    : true
                )
                && (
                  quoteAssetData
                    ? r.order.takerAssetData === quoteAssetData
                    : true
                )
              ),
            ),
        },
        asks: {
          total: qty.asks,
          page,
          perPage,
          records: asksAscendingOrder
            .slice(0, qty.asks)
            .map(order => ({
              order,
              metaData: {},
            }))
            .filter(
              r => (
                (
                  baseAssetData
                    ? r.order.makerAssetData === baseAssetData
                    : true
                )
                && (
                  quoteAssetData
                    ? r.order.takerAssetData === quoteAssetData
                    : true
                )
              ),
            ),
        },
      };
    },
    getOrders({
      makerAssetProxyId,
      takerAssetProxyId,
      makerAssetAddress,
      takerAssetAddress,
      exchangeAddress,
      senderAddress,
      makerAssetData,
      takerAssetData,
      traderAssetData,
      makerAddress = '0x9e56625509c2f60af937f23b7b532600390e8c8b',
      takerAddress = '0x9e56625509c2f60af937f23b7b532600390e8c8b',
      traderAddress,
      feeRecipientAddress,
      networkId,
      page,
      perPage,
    }) {
      let ordersAscendingOrder = orders;
      if (makerAssetData && takerAssetData) {
        ordersAscendingOrder = orders.map(item => item)
          .sort((a, b) => a.takerFee - b.takerFee);
      }

      return {
        total: orders.length,
        page,
        perPage,
        records: ordersAscendingOrder
          .slice(page, page + perPage)
          .map(order => ({
            order,
            metaData: {},
          }))
          .filter(
            r => (
              (
                makerAssetData
                  ? r.order.makerAssetData === makerAssetData
                  : true
              )
              && (
                takerAssetData
                  ? r.order.takerAssetData === takerAssetData
                  : true
              )
            ),
          ),
      };
    },
  };
}
