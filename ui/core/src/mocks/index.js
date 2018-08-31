import assetPairsJson from './assetPairs.json';

/* https://github.com/Marak/faker.js/blob/master/lib/finance.js#L223 */
function randomEthereumAddress() {
  const hexadecimalSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'];
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
    network: networkId,
    page,
    perPage,
    records,
  };
}

export function mocksOrdersFactory({
  makerAssetData,
  takerAssetData,
  qty = {
    bids: 50,
    asks: 50,
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
            takerAddress: '0x0000000000000000',
            feeRecipientAddress: randomEthereumAddress(),
            senderAddress: randomEthereumAddress(),
            makerAssetAmount: '10000000000000000',
            takerAssetAmount: '20000000000000000',
            makerFee: '100000000000000',
            takerFee: '200000000000000',
            expirationTimeSeconds: '1532560590',
            salt: '1532559225',
            makerAssetData: type === 'bid' ? pair.assetDataA.assetData : pair.assetDataB.assetData,
            takerAssetData: type === 'bid' ? pair.assetDataB.assetData : pair.assetDataA.assetData,
            exchangeAddress: randomEthereumAddress(),
            signature: '0x012761a3ed31b43c8780e905a260a35faefcc527be7516aa11c0256729b5b351bc33',
          },
          done: !bids && !asks,
        };
      },
    };
  }

  const ordersProvider = ordersIterator();
  const orders = Array(qty.bids + qty.asks).fill().map(() => ordersProvider.next().value);

  return {
    // TODO: Sort and filter
    getOrders() {
      return {
        total: 100,
        page: 1,
        perPage: 10,
        records: orders.map(order => ({
          order,
          metaData: {},
        })),
      };
    },
  };
}
