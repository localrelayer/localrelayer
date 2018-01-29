const EIP20 = artifacts.require('./EIP20.sol');
const EIP20Factory = artifacts.require('./EIP20Factory.sol');
const WETH9 = artifacts.require('./WETH9.sol');
const Exchange = artifacts.require('./Exchange.sol');
const TokenRegistry = artifacts.require('./TokenRegistry.sol');
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol');

const fs = require('fs');
const { finance } = require('faker');

const generateTradingInfo = () => ({
  volume: finance.amount(0, 500, 8),
  highPrice: finance.amount(0, 2, 8),
  lowPrice: finance.amount(0, 2, 8),
  change24Hour: finance.amount(-70, 70),
  lastPrice: finance.amount(0, 2, 8),
});

const protocolStuff = {};

const tokens = require('../src/api/seeds/tokens.old.json');

const wethScaffold = {
  address: '0x0',
  symbol: 'WETH',
  decimals: 18,
  name: 'Ether Token',
  trading: {},
};

module.exports = (deployer) => {
  deployer.deploy(WETH9).then(() => {
    wethScaffold.address = WETH9.address;
  });
  deployer.deploy(EIP20);
  deployer.link(EIP20, EIP20Factory);
  deployer.deploy(EIP20Factory).then(() => {
    const factory = EIP20Factory.at(EIP20Factory.address);
    const promises = tokens.filter(t => t.symbol !== 'WETH').map((t, i) => factory
      .createEIP20(100000 * (10 ** t.decimals), t.name, t.decimals, t.symbol, {
        from: web3.eth.accounts[0],
        gas: 1000000,
      })
      .then((res) => {
        if (tokens[i].symbol === 'ZRX') {
          protocolStuff.zrx = res.receipt.logs[0].address;
        }
        tokens[i].address = res.receipt.logs[0].address;
        tokens[i].trading.WETH = generateTradingInfo();
        if (Math.random() > 0.35) {
          tokens[i].trading.DAI = generateTradingInfo();
        }
        console.log('created', tokens[i].name);
      })
      .catch((e) => {
        console.log(e);
      }));
    Promise.all(promises).then(() => {
      console.log('writing tokens.json to src/api/seeds');
      fs.writeFileSync('src/api/seeds/tokens.json', JSON.stringify([wethScaffold, ...tokens]));
      console.log('successfully created');
      deployer.deploy(TokenTransferProxy).then(() => {
        protocolStuff.proxy = TokenTransferProxy.address;
        deployer.deploy(TokenRegistry).then(() => {
          protocolStuff.registry = TokenRegistry.address;
          deployer.deploy(Exchange, protocolStuff.zrx, protocolStuff.proxy).then(() => {
            protocolStuff.exchange = Exchange.address;
            console.log('===========================================');
            console.log('writing protocol.json to src/utils/protocol');
            fs.writeFileSync('src/utils/protocol.json', JSON.stringify(protocolStuff));
            console.log('===========================================');
          });
        });
      });
    });
  });
};
