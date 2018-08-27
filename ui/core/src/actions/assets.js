import {
  actionTypes,
} from '.';


export const fetchAssetPairsRequest = query => ({
  type: actionTypes.FETCH_RESOURCES_REQUEST,
  query,
});
