import {
  actionTypes,
} from '.';

export const fetchAssetPairsRequest = query => ({
  type: actionTypes.FETCH_ASSET_PAIRS_REQUEST,
  query,
});

export const checkPairRequest = query => ({
  type: actionTypes.CHECK_PAIR_REQUEST,
  query,
});
