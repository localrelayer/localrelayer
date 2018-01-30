const EIP20 = artifacts.require('./EIP20.sol');
const EIP20Factory = artifacts.require('./EIP20Factory.sol');

const { ZeroEx } = require('0x.js');
const fs = require('fs');
const Web3 = require('web3');
const { finance } = require('faker');

const generateTradingInfo = () => ({
  volume: finance.amount(0, 500, 8),
  highPrice: finance.amount(0, 2, 8),
  lowPrice: finance.amount(0, 2, 8),
  change24Hour: finance.amount(-70, 70),
  lastPrice: finance.amount(0, 2, 8),
});

const tokens = require('../src/api/seeds/tokens.scaffold.json');

const baseTokens = [{
  address: '0x0',
  symbol: 'WETH',
  decimals: 18,
  name: 'Ether Token',
  trading: {},
}, {
  address: '0x0',
  symbol: 'ZRX',
  decimals: 18,
  name: '0x Protocol',
  trading: {},
}];

module.exports = (deployer) => {
  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  const zeroEx = new ZeroEx(web3.currentProvider, {
    networkId: 50,
  });

  deployer.deploy(EIP20);
  deployer.link(EIP20, EIP20Factory);
  deployer.deploy(EIP20Factory).then(async () => {
    const zrx = await zeroEx.tokenRegistry.getTokenAddressBySymbolIfExistsAsync('ZRX');
    const weth = await zeroEx.tokenRegistry.getTokenAddressBySymbolIfExistsAsync('WETH');
    const addresses = await zeroEx.getAvailableAddressesAsync();

    const factory = EIP20Factory.at(EIP20Factory.address);
    const promises = tokens.map((t, i) =>
      factory.createEIP20(
        100000 * (10 ** t.decimals),
        t.name,
        t.decimals,
        t.symbol, {
          from: addresses[0],
          gas: 1000000,
        },
      ).then((res) => {
        tokens[i].address = res.receipt.logs[0].address;
        tokens[i].trading.WETH = generateTradingInfo();
        if (Math.random() > 0.35) {
          tokens[i].trading.DAI = generateTradingInfo();
        }
        console.log('created', tokens[i].name);
      }));
    await Promise.all(promises);
    baseTokens[0].address = weth;
    baseTokens[0].trading.DAI = generateTradingInfo();

    baseTokens[1].address = zrx;
    baseTokens[1].trading.WETH = generateTradingInfo();
    baseTokens[1].trading.DAI = generateTradingInfo();

    console.log('writing tokens.json to src/api/seeds');
    fs.writeFileSync('src/api/seeds/tokens.json', JSON.stringify([...baseTokens, ...tokens]));
    console.log('successfully created');
  });
};
