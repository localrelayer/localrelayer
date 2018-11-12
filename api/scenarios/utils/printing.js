import {
  OrderStatus,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

import {
  DECIMALS, UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from './constants';

const Table = require('cli-table');

const EMPTY_DATA = [];
const DEFAULT_EVENTS = ['Fill', 'Transfer', 'CancelUpTo', 'Cancel'];

const defaultSchema = {
  style: {
    head: ['green'],
  },
};

const borderlessSchema = {
  ...defaultSchema,
  chars: {
    top: '',
    'top-mid': '',
    'top-left': '',
    'top-right': '',
    bottom: '',
    'bottom-mid': '',
    'bottom-left': '',
    'bottom-right': '',
    left: '',
    'left-mid': '',
    mid: '',
    'mid-mid': '',
    right: '',
    'right-mid': '',
    middle: ' ',
  },
  style: { 'padding-left': 1, 'padding-right': 0, head: ['blue'] },
};

const dataSchema = {
  ...borderlessSchema,
  style: { 'padding-left': 1, 'padding-right': 0, head: ['yellow'] },
};

export class PrintUtils {
  static printScenario(header) {
    const table = new Table({
      ...defaultSchema,
      head: [header],
    });
    PrintUtils.pushAndPrint(table, EMPTY_DATA);
  }

  static printData(header, tableData) {
    const table = new Table({
      ...dataSchema,
      head: [header, ''],
    });
    PrintUtils.pushAndPrint(table, tableData);
  }

  static printHeader(header) {
    const table = new Table({
      ...borderlessSchema,
      style: { 'padding-left': 0, 'padding-right': 0, head: ['blue'] },
      head: [header],
    });
    console.log('');
    PrintUtils.pushAndPrint(table, EMPTY_DATA);
  }

  static pushAndPrint(table, tableData) {
    tableData.forEach((col) => {
      col.forEach((item, index) => {
        if (col[index] === UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toString()) {
          col[index] = 'MAX_UINT';
        }
      });
      table.push(col);
    });
    console.log(table.toString());
  }

  constructor(
    web3Wrapper,
    contractWrappers,
    accounts,
    tokens,
  ) {
    this.contractWrappers = contractWrappers;
    this.web3Wrapper = web3Wrapper;
    this.accounts = accounts;
    this.tokens = tokens;
    this.web3Wrapper.abiDecoder.addABI(contractWrappers.exchange.abi);
    this.web3Wrapper.abiDecoder.addABI(contractWrappers.erc20Token.abi);
    this.web3Wrapper.abiDecoder.addABI(contractWrappers.erc721Token.abi);
  }

  printAccounts() {
    const data = [];
    Object.entries(this.accounts).forEach((nameAddress) => {
      const accountName = nameAddress[0].charAt(0).toUpperCase() + nameAddress[0].slice(1);
      data.push([accountName, nameAddress[1]]);
    });
    PrintUtils.printData('Accounts', data);
  }

  async fetchAndPrintContractBalancesAsync() {
    const flattenedBalances = [];
    const flattenedAccounts = Object.keys(this.accounts).map(
      account => account.charAt(0).toUpperCase() + account.slice(1),
    );
    for (const tokenSymbol in this.tokens) {
      const balances = [tokenSymbol];
      const tokenAddress = this.tokens[tokenSymbol];
      for (const account in this.accounts) {
        const address = this.accounts[account];
        const balanceBaseUnits = await this.contractWrappers.erc20Token.getBalanceAsync(
          tokenAddress,
          address,
        );
        const balance = Web3Wrapper.toUnitAmount(balanceBaseUnits, DECIMALS);
        balances.push(balance.toString());
      }
      flattenedBalances.push(balances);
    }
    const table = new Table({
      ...dataSchema,
      head: ['Token', ...flattenedAccounts],
    });
    PrintUtils.printHeader('Balances');
    PrintUtils.pushAndPrint(table, flattenedBalances);
  }

  async fetchAndPrintContractAllowancesAsync() {
    const erc20ProxyAddress = this.contractWrappers.erc20Proxy.address;
    const flattenedAllowances = [];
    const flattenedAccounts = Object.keys(this.accounts).map(
      account => account.charAt(0).toUpperCase() + account.slice(1),
    );
    for (const tokenSymbol in this.tokens) {
      const allowances = [tokenSymbol];
      const tokenAddress = this.tokens[tokenSymbol];
      for (const account in this.accounts) {
        const address = this.accounts[account];
        const balance = await this.contractWrappers.erc20Token.getAllowanceAsync(
          tokenAddress,
          address,
          erc20ProxyAddress,
        );
        allowances.push(balance.toString());
      }
      flattenedAllowances.push(allowances);
    }
    const table = new Table({
      ...dataSchema,
      head: ['Token', ...flattenedAccounts],
    });
    PrintUtils.printHeader('Allowances');
    PrintUtils.pushAndPrint(table, flattenedAllowances);
  }

  printTransaction(
    header,
    txReceipt,
    data = [],
    eventNames = DEFAULT_EVENTS,
  ) {
    PrintUtils.printHeader('Transaction');
    const headerColor = txReceipt.status === 1 ? 'green' : 'red';
    const table = new Table({
      ...defaultSchema,
      head: [header, txReceipt.transactionHash],
      style: { ...defaultSchema.style, head: [headerColor] },
    });
    const gasUsed = txReceipt.gasUsed.toString().startsWith('0x')
      ? parseInt(txReceipt.gasUsed.toString(), 16).toString()
      : txReceipt.gasUsed;
    const status = txReceipt.status === 1 ? 'Success' : 'Failure';
    const tableData = [...data, ['gasUsed', gasUsed.toString()], ['status', status]];
    PrintUtils.pushAndPrint(table, tableData);

    if (txReceipt.logs.length > 0) {
      PrintUtils.printHeader('Logs');
      txReceipt.logs.forEach((log) => {
        const decodedLog = this.web3Wrapper.abiDecoder.tryToDecodeLogOrNoop(log);
        const { event } = log;
        if (event && eventNames.includes(event)) {
          const { args } = decodedLog;
          const logData = [['contract', log.address], ...Object.entries(args)];
          PrintUtils.printData(`${event}`, logData);
        }
      });
    }
  }

  printOrderInfos(orderInfos) {
    const data = [];
    Object.entries(orderInfos).forEach((keyValue) => {
      data.push([keyValue[0], OrderStatus[keyValue[1].orderStatus]]);
    });
    PrintUtils.printData('Order Info', data);
  }

  printOrder(order) {
    PrintUtils.printData('Order', Object.entries(order));
  }
}
