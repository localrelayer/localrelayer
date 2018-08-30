import {
  actionTypes,
} from '.';

export const fetchAssetPairsRequest = query => ({
  type: actionTypes.FETCH_ASSET_PAIRS_REQUEST,
  query,
});
