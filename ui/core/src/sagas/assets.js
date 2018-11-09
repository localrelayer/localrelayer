import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import {
  assetDataUtils,
} from '0x.js';
import {
  addressUtils,
} from '@0x/utils';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  getAssetByIdField,
  getResourceById,
  getWalletState,
} from '../selectors';
import api from '../api';
import {
  cachedTokens,
} from '../cache';
import abiZRX from '../contracts/abiZRX';
// https://etherscan.io/address/0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0#code
import abiEOS from '../contracts/abiEOS';
import {
  actionTypes,
} from '../actions';
import ethApi from '../ethApi';
import BigNumber from '../../BigNumber';


function* extractInfo(tokenContract) {
  return yield eff.all({
    name: eff.call(tokenContract.methods.name().call),
    symbol: eff.call(tokenContract.methods.symbol().call),
    decimals: eff.call(tokenContract.methods.decimals().call),
  });
}

/* At this moment the function support only ERC20 tokens */
export function* getAssetAdditionalInfo({
  assetData,
  networkId,
}) {
  let tokenAddress = assetData;
  try {
    const { tokenAddress: address } = assetDataUtils.decodeAssetDataOrThrow(assetData);
    tokenAddress = address;
  } catch(e) {} /* eslint-disable-line */
  if (cachedTokens[networkId][tokenAddress]) {
    return {
      ...cachedTokens[networkId][tokenAddress],
      id: assetData,
      address: tokenAddress,
    };
  }/*
    we cannot decode some specific types of assets using ZRX ABI,
    so in this case we have to use EOS ABI
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
    const eosContract = new web3.eth.Contract(abiEOS, tokenAddress);
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
        Math.ceil(firstPageResponse.total / perPage),
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

export function* fetchTradingInfo(opts = { networkId: 1 }) {
  const actions = createActionCreators('read', {
    resourceType: 'tradingInfo',
    requestKey: 'apiTradingInfo',
    mergeListIds: true,
  });
  try {
    yield eff.put(actions.pending());
    const response = yield eff.call(
      api.getTradingInfo,
      opts,
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
  const web3 = ethApi.getWeb3();
  const networkId = eff.call(web3.eth.net.getId);
  const contractWrappers = ethApi.getWrappers(networkId);
  const amount = action.payload.isTradable
    ? contractWrappers.erc20Token.UNLIMITED_ALLOWANCE_IN_BASE_UNITS
    : BigNumber(0);
  const selectedAccount = yield eff.select(getWalletState('selectedAccount'));
  yield eff.call(
    [contractWrappers.erc20Token, contractWrappers.erc20Token.setProxyAllowanceAsync],
    action.payload.asset.address,
    selectedAccount,
    amount,
  );
}

function* processDepositWithdraw(action) {
  const web3 = ethApi.getWeb3();
  const networkId = eff.call(web3.eth.net.getId);
  const contractWrappers = ethApi.getWrappers(networkId);
  const selectedAccount = yield eff.select(getWalletState('selectedAccount'));
  const etherToken = yield eff.select(getAssetByIdField({
    fieldName: 'symbol',
    value: 'WETH',
  }));
  yield eff.call(
    [
      contractWrappers.etherToken,
      contractWrappers.etherToken[`${action.payload.type}Async`],
    ],
    etherToken.address,
    Web3Wrapper.toBaseUnitAmount(BigNumber(action.payload.amount), etherToken.decimals),
    selectedAccount,
    {
      // Default gas amount isn't enought for withdrawal
      gasLimit: 100000,
    },
  );
}

export function* takeApproval() {
  yield eff.takeEvery(actionTypes.SET_APPROVAL_REQUEST, processApproval);
}

export function* takeDepositAndWithdraw() {
  yield eff.takeEvery(actionTypes.DEPOSIT_WITHDRAW_REQUEST, processDepositWithdraw);
}
