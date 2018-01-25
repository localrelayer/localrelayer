const contract = require('truffle-contract');
const Web3 = require('web3');
const { finance } = require('faker');
const fs = require('fs');
const EIP20Factory = require('../build/contracts/EIP20Factory.json');
const EIP20 = require('../build/contracts/EIP20.json');

const tokens = require('../src/api/seeds/tokens.old.json');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const factory = contract(EIP20Factory);
const token = contract(EIP20);

const generateTradingInfo = () => ({
  volume: finance.amount(0, 500, 8),
  highPrice: finance.amount(0, 2, 8),
  lowPrice: finance.amount(0, 2, 8),
  change24Hour: finance.amount(-70, 70),
  lastPrice: finance.amount(0, 2, 8),
});

const zrxAndWeth = [
  {
    address: '0x25b8fe1de9daf8ba351890744ff28cf7dfa8f5e3',
    symbol: 'ZRX',
    decimals: 18,
    name: '0x Protocol',
    trading: {
      WETH: {
        volume: '457.27679076',
        highPrice: '0.41511175',
        lowPrice: '1.02818864',
        change24Hour: '23.97',
        lastPrice: '0.57561175',
      },
      DAI: {
        volume: '15.27679076',
        highPrice: '7.41511175',
        lowPrice: '3.02818864',
        change24Hour: '23.97',
        lastPrice: '0.57561175',
      },
    },
  },
  {
    address: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
    symbol: 'WETH',
    decimals: 18,
    name: 'Ether Token',
    trading: {
      DAI: {
        volume: '457.27679076',
        highPrice: '0.41511175',
        lowPrice: '1.02818864',
        change24Hour: '23.97',
        lastPrice: '0.57561175',
      },
    },
  },
];

factory.setProvider(web3.currentProvider);
token.setProvider(web3.currentProvider);

factory.deployed().then((instance) => {
  const promises = tokens.map((t, i) => {
    return instance
      .createEIP20(100000 * (10 ** t.decimals), t.name, t.decimals, t.symbol, {
        from: web3.eth.accounts[0],
        gas: 1000000,
      })
      .then((res) => {
        tokens[i].address = res.receipt.logs[0].address;
        tokens[i].trading.WETH = generateTradingInfo();
        if (Math.random() > 0.2) {
          tokens[i].trading.DAI = generateTradingInfo();
        }
        console.log('created', tokens[i].name);
      })
      .catch((e) => {
        console.log(e);
      });
  });
  Promise.all(promises).then(() => {
    console.log('writing tokens.json to src/api/seeds');
    fs.writeFileSync('src/api/seeds/tokens.json', JSON.stringify([...zrxAndWeth, ...tokens]));
    console.log('successfully created');
  })
  // instance.created.call(web3.eth.accounts[0], 53).then((res) => {
  //   const ins = token.at(res);
  //   ins.name.call().then((name) => {
  //     console.log(res, name);
  //   });
  // });
});
