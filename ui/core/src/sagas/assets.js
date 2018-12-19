import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import {
  assetDataUtils,
  BigNumber,
} from '0x.js';
import {
  addressUtils,
} from '@0x/utils';

import {
  getAssetByIdField,
  getResourceById,
  getResourceMap,
  getWalletState,
} from '../selectors';
import * as utils from '../utils';
import api from '../api';
import ethApi from '../ethApi';
import {
  cachedTokens,
} from '../cache';
import abiZRX from '../contracts/abiZRX';
import abiBytes32 from '../contracts/abiBytes32';
import {
  actionTypes,
} from '../actions';
import {
  saveTransaction,
} from './transactions';


function* extractInfo(tokenContract) {
  return yield eff.all({
    name: eff.call(tokenContract.methods.name().call),
    symbol: eff.call(tokenContract.methods.symbol().call),
    decimals: eff.call(tokenContract.methods.decimals().call),
  });
}

/* At this moment the function supports only ERC20 tokens */
export function* getAssetAdditionalInfo({
  assetData,
  networkId,
}) {
  let tokenAddress = assetData;
  try {
    const { tokenAddress: address } = assetDataUtils.decodeAssetDataOrThrow(assetData);
    tokenAddress = address;
  } catch (e) {
    console.log(e);
  }
  if (cachedTokens[networkId][tokenAddress]) {
    return {
      ...cachedTokens[networkId][tokenAddress],
      id: assetData,
      address: tokenAddress,
    };
  }/*
    we cannot decode some specific types of assets using ZRX ABI,
    so in this case we have to use another ABI with type 'bytes32' instead of 'string'
    https://ethereum.stackexchange.com/questions/37165/web3js-1-0-0-beta-24-the-returned-value-is-not-a-convertible-string
   */
  try {
    /*
     * If call new web3 using call effect we will have an issue because of new context,
     * issue appears only with redux-saga-test-plan
     */
    const web3 = ethApi.getWeb3();
    const zrxContract = new web3.eth.Contract(abiZRX, tokenAddress);
    const additionalInfo = yield eff.call(extractInfo, zrxContract);
    return {
      id: assetData,
      address: tokenAddress,
      name: additionalInfo.name,
      symbol: additionalInfo.symbol,
      decimals: parseInt(additionalInfo.decimals, 10),
    };
  } catch (error) {
    const eosContract = new web3.eth.Contract(abiBytes32, tokenAddress);
    const additionalInfo = yield eff.call(extractInfo, eosContract);
    const decodedInfo = yield eff.all({
      name: eff.call(web3.utils.hexToAscii, additionalInfo.name),
      symbol: eff.call(web3.utils.hexToAscii, additionalInfo.symbol),
    });
    return {
      id: assetData,
      address: tokenAddress,
      name: decodedInfo.name,
      symbol: decodedInfo.symbol,
      decimals: parseInt(additionalInfo.decimals, 10),
    };
  }
}

export function* fetchAssetPairs(opts = { networkId: 1 }) {
  const actions = createActionCreators('read', {
    resourceType: 'assetPairs',
    requestKey: 'assetPairs',
    list: 'listed',
    mergeListIds: true,
  });
  try {
    yield eff.put(actions.pending());
    const firstPageResponse = yield eff.call(
      api.getAssetPairs,
      {
        perPage: 1000,
        ...opts,
      },
    );
    const perPage = firstPageResponse.records.length;
    const restPagesResponses = yield eff.all(
      Array(
        Math.ceil((firstPageResponse.total / perPage) || 0),
      )
        .fill(null)
        .map(
          (item, index) => (
            eff.call(api.getAssetPairs, {
              ...opts,
              page: index + 1,
              perPage,
            })
          ),
        )
        .slice(1),
    );
    const records = [
      ...firstPageResponse.records,
    ].concat(
      ...restPagesResponses.map(r => r.records),
    );
    // Create id field by merging assetData fields
    const assetPairs = records.map(
      pair => ({
        ...pair,
        id: `${pair.assetDataA.assetData}_${pair.assetDataB.assetData}`,
      }),
    );
    /*
    we use reduce in order to avoid duplicating assets
    assets contain only unique values, because we use asset as object key,
    values could be any e.g. null. As an output we have an array with unique assets
    */
    const assetsRaw = Object.keys(
      records.reduce((acc, curr) => {
        acc[curr.assetDataA.assetData] = null;
        acc[curr.assetDataB.assetData] = null;
        return acc;
      }, {}),
    );
    const assets = yield eff.all(
      assetsRaw.map(
        asset => eff.call(getAssetAdditionalInfo, {
          assetData: asset,
          networkId: opts.networkId,
        }),
      ),
    );
    yield eff.put(actions.succeeded({
      resources: assetPairs,
      includedResources: {
        assets,
      },
    }));
  } catch (err) {
    console.log(err);
    yield eff.put(actions.succeeded({
      resources: [],
    }));
  }
}

export function* fetchAllTradingInfo(opts = { networkId: 1 }) {
  const actions = createActionCreators('read', {
    resourceType: 'tradingInfo',
    requestKey: 'apiTradingInfo',
  });
  try {
    yield eff.put(actions.pending());
    const assetPairs = yield eff.select(getResourceMap('assetPairs'));
    const pairs = Object.keys(assetPairs).map((pair) => {
      const [assetDataA, assetDataB] = pair.split('_');
      return {
        networkId: opts.networkId,
        assetDataA,
        assetDataB,
      };
    });
    const response = yield eff.call(
      api.getTradingInfo,
      {
        pairs,
      },
    );
    yield eff.put(actions.succeeded({
      resources: response.records,
    }));
  } catch (err) {
    console.log(err);
    yield eff.put(actions.succeeded({
      resources: [],
    }));
  }
}

function determineAssetIdType(asset) {
  try {
    try {
      const { tokenAddress } = assetDataUtils.decodeAssetDataOrThrow(asset);
      return {
        type: 'address',
        value: tokenAddress,
      };
    } catch (e) {} /* eslint-disable-line */

    if (addressUtils.isAddress(asset)) {
      return {
        type: 'address',
        value: asset,
      };
    }

    const maxLength = 30;
    if (
      /^[a-z0-9 ]+$/i.test(asset)
      && asset.length <= maxLength
    ) {
      return {
        type: 'symbol',
        value: asset,
      };
    }
  } catch (err) {
    console.log(err);
  }
  return null;
}

export function* checkAssetPair({
  baseAsset,
  quoteAsset,
  networkId,
}) {
  const assetsTypes = {
    /* return type of null which means an format error */
    baseAsset: determineAssetIdType(baseAsset),
    quoteAsset: determineAssetIdType(quoteAsset),
  };
  const baseAssetResource = (
    (
      assetsTypes.baseAsset
      && (
        yield eff.select(getAssetByIdField({
          fieldName: assetsTypes.baseAsset.type,
          value: assetsTypes.baseAsset.value,
        }))
      )
    ) || (
      assetsTypes.baseAsset.type === 'address' && (
        yield eff.call(getAssetAdditionalInfo, {
          assetData: baseAsset,
          networkId,
        })
      )
    )
  );
  const quoteAssetResource = (
    (
      assetsTypes.quoteAsset
      && (
        yield eff.select(getAssetByIdField({
          fieldName: assetsTypes.quoteAsset.type,
          value: assetsTypes.quoteAsset.value,
        }))
      )
    ) || (
      assetsTypes.quoteAsset.type === 'address' && (
        yield eff.call(getAssetAdditionalInfo, {
          assetData: quoteAsset,
          networkId,
        })
      )
    )
  );

  if (baseAssetResource && quoteAssetResource) {
    const assetPair = yield eff.select(getResourceById(
      'assetPairs',
      `${baseAssetResource.id}_${quoteAssetResource.id}`,
    ));
    if (assetPair) {
      return {
        assetPair,
        isListed: yield eff.select(s => s.assetPairs.lists.listed.includes(assetPair.id)),
      };
    }
    const actions = createActionCreators('create', {
      resourceType: 'assetPairs',
      requestKey: 'assetPairs',
      list: 'notListed',
      mergeListIds: true,
    });

    const notListedAssetPair = {
      id: `${baseAssetResource.id}_${quoteAssetResource.id}`,
      assetDataA: baseAssetResource,
      assetDataB: quoteAssetResource,
    };
    yield eff.put(actions.succeeded({
      resources: [notListedAssetPair],
      includedResources: {
        assets: [
          baseAssetResource,
          quoteAssetResource,
        ],
      },
    }));

    return {
      assetPair: notListedAssetPair,
      isListed: false,
    };
  }

  const errors = {
    ...(!baseAssetResource ? { baseAssetResource: 'Wrong asset' } : {}),
    ...(!quoteAssetResource ? { quoteAssetResource: 'Wrong asset' } : {}),
  };
  throw errors;
}

function* processApproval(action) {
  try {
    const web3 = ethApi.getWeb3();
    const networkId = yield eff.call(web3.eth.net.getId);
    const contractWrappers = ethApi.getWrappers(networkId);
    const amount = action.isTradable
      ? contractWrappers.erc20Token.UNLIMITED_ALLOWANCE_IN_BASE_UNITS
      : new BigNumber(0);
    const selectedAccount = yield eff.select(getWalletState('selectedAccount'));

    const transactionHash = yield eff.call(
      [
        contractWrappers.erc20Token,
        contractWrappers.erc20Token.setProxyAllowanceAsync,
      ],
      action.asset.address,
      selectedAccount,
      amount,
    );

    yield eff.fork(
      saveTransaction,
      {
        transactionHash,
        address: selectedAccount.toLowerCase(),
        name: 'Allowance',
        networkId,
        meta: {
          asset: {
            name: action.asset.name,
            symbol: action.asset.symbol,
            address: action.asset.address,
            data: action.asset.id,
          },
          amount,
        },
      },
    );
  } catch (e) {
    console.log(e);
  }
}

function* processDepositOrWithdraw(action) {
  const web3 = ethApi.getWeb3();
  const networkId = yield eff.call(web3.eth.net.getId);
  const contractWrappers = ethApi.getWrappers(networkId);
  const selectedAccount = yield eff.select(getWalletState('selectedAccount'));
  const etherToken = yield eff.select(getAssetByIdField({
    fieldName: 'symbol',
    value: 'WETH',
  }));
  const amount = utils.toBaseUnitAmount(
    new BigNumber(action.amount),
    etherToken.decimals,
  );
  try {
    const transactionHash = yield eff.call(
      [
        contractWrappers.etherToken,
        contractWrappers.etherToken[`${action.method}Async`],
      ],
      etherToken.address,
      amount,
      selectedAccount,
      {
      // Default gas amount isn't enought for withdrawal
        gasLimit: 100000,
      },
    );
    yield eff.fork(
      saveTransaction,
      {
        transactionHash,
        address: selectedAccount.toLowerCase(),
        name: utils.cfl(action.method),
        networkId,
        meta: {
          amount,
        },
      },
    );
  } catch (e) {
    console.log(e);
  }
  action.formActions.resetForm({});
}

export function* takeApproval() {
  yield eff.takeEvery(actionTypes.SET_APPROVAL_REQUEST, processApproval);
}

export function* takeDepositAndWithdraw() {
  yield eff.takeEvery(actionTypes.DEPOSIT_WITHDRAW_REQUEST, processDepositOrWithdraw);
}
