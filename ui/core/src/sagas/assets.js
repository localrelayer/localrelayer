import {
  takeEvery,
  call,
  all,
  put,
} from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import {
  actionTypes,
} from '../actions';
import api from '../api';
import cachedTokens from '../cache/tokens';
import abiZRX from '../contracts/EtherToken';
// https://etherscan.io/address/0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0#code
import abiEOS from '../contracts/EtherTokenAlt';

function* extractInfo(tokenContract) {
  return yield all({
    name: call(tokenContract.methods.name().call),
    symbol: call(tokenContract.methods.symbol().call),
    decimals: call(tokenContract.methods.decimals().call),
  });
}

function* getAssetAdditionalInfo(asset) {
  if (cachedTokens[asset]) {
    return {
      ...cachedTokens[asset],
      id: asset,
    };
  }
  /*
    we cannot decode some specific types of assets using ZRX ABI,
    so in this case we have to use EOS ABI
   */
  try {
    const tokenContract = new web3.eth.Contract(abiZRX, asset);
    const additionalInfo = yield call(extractInfo, tokenContract);
    return {
      address: asset,
      ...additionalInfo,
    };
  } catch (error) {
    const tokenContract = new web3.eth.Contract(abiEOS, asset);
    const additionalInfo = yield call(extractInfo, tokenContract);
    const decodedInfo = yield all({
      name: call(web3.utils.hexToAscii, additionalInfo.name),
      symbol: call(web3.utils.hexToAscii, additionalInfo.symbol),
    });
    return {
      id: asset,
      address: asset,
      decimals: additionalInfo.decimals,
      ...decodedInfo,
    };
  }
}

export function* fetchAssetPairs() {
  const actions = createActionCreators('read', {
    resourceType: 'assetPairs',
    requestKey: 'assetPairs',
    list: 'assetPairs',
    mergeListIds: true,
  });
  try {
    yield put(actions.pending());

    const firsPageResponse = yield call(
      api.getAssetPairs,
      {
        perPage: 1000,
      },
    );
    const perPage = firsPageResponse.records.length;
    const restPagesResponses = yield all(
      Array(
        Math.ceil(firsPageResponse.total / perPage),
      )
        .fill(null)
        .map(
          (item, index) => (
            call(api.getAssetPairs, {
              page: index + 1,
              perPage,
            })
          ),
        )
        .slice(1),
    );
    const records = [
      ...firsPageResponse.records,
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
    )
    /*
     in order to split up asset's address and contract address we use slice() here, which convert
     0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 to
     0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 so we able to extract an addition info
     */
      .map(item => `0x${item.slice(34)}`);
    const assets = yield all(assetsRaw.map(
      item => call(getAssetAdditionalInfo, item),
    ));
    yield put(actions.succeeded({
      resources: assetPairs,
      includedResources: {
        assets,
      },
    }));
  } catch (err) {
    console.log(err);
    yield put(actions.succeeded({
      resources: [],
    }));
  }
}

export function* takeFetchAssetPairsRequest() {
  yield takeEvery(
    actionTypes.FETCH_ASSET_PAIRS_REQUEST,
    fetchAssetPairs,
  );
}
