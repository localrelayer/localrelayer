import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import {
  addressUtils,
} from '@0xproject/utils';

import {
  getAssetByIdField,
  getResourceById,
} from '../selectors';
import api from '../api';
import {
  cachedTokens,
} from '../cache';
import abiZRX from '../contracts/abiZRX';
// https://etherscan.io/address/0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0#code
import abiEOS from '../contracts/abiEOS';


function* extractInfo(tokenContract) {
  return yield eff.all({
    name: eff.call(tokenContract.methods.name().call),
    symbol: eff.call(tokenContract.methods.symbol().call),
    decimals: eff.call(tokenContract.methods.decimals().call),
  });
}

export function* getAssetAdditionalInfo({
  asset,
  networkId,
}) {
  if (cachedTokens[networkId][asset]) {
    return {
      id: asset,
      ...cachedTokens[networkId][asset],
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
    const zrxContract = new web3.eth.Contract(abiZRX, asset);
    const additionalInfo = yield eff.call(extractInfo, zrxContract);
    return {
      id: asset,
      address: asset,
      name: additionalInfo.name,
      symbol: additionalInfo.symbol,
      decimals: parseInt(additionalInfo.decimals, 10),
    };
  } catch (error) {
    const eosContract = new web3.eth.Contract(abiEOS, asset);
    const additionalInfo = yield eff.call(extractInfo, eosContract);
    const decodedInfo = yield eff.all({
      name: eff.call(web3.utils.hexToAscii, additionalInfo.name),
      symbol: eff.call(web3.utils.hexToAscii, additionalInfo.symbol),
    });
    return {
      id: asset,
      address: asset,
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
          asset,
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

function determineAssetIdType(asset) {
  try {
    if (addressUtils.isAddress(asset)) {
      return 'address';
    }

    const maxLength = 30;
    if (
      /^[a-z0-9 ]+$/i.test(asset)
      && asset.length <= maxLength
    ) {
      return 'symbol';
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
        yield eff.select(s => getAssetByIdField({
          fieldName: assetsTypes.baseAsset,
          value: baseAsset,
        })(s.assets.resources))
      )
    ) || (
      assetsTypes.baseAsset === 'address' && (
        yield eff.call(getAssetAdditionalInfo, {
          asset: baseAsset,
          networkId,
        })
      )
    )
  );
  const quoteAssetResource = (
    (
      assetsTypes.quoteAsset
      && (
        yield eff.select(s => getAssetByIdField({
          fieldName: assetsTypes.quoteAsset,
          value: quoteAsset,
        })(s.assets.resources))
      )
    ) || (
      assetsTypes.quoteAsset === 'address' && (
        yield eff.call(getAssetAdditionalInfo, {
          asset: quoteAsset,
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
      requestKey: 'assetPais',
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
