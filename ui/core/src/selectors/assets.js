import {
  createSelector,
} from 'reselect';
import {
  getResourceMap,
} from './resources';

// export const getAssetByIdField = ({
//   fieldName,
//   value,
// }) => (assets) => {
//   const assetAddress = Object.keys(assets)
//     .find(address => (assets[address][fieldName] === value));
//   return assetAddress ? assets[assetAddress] : null;
// };

export const getAssetByIdField = ({
  fieldName,
  value,
}) => createSelector([
  getResourceMap('assets'),
],
(assets) => {
  const assetAddress = Object.keys(assets)
    .find(address => (assets[address][fieldName] === value));

  return assetAddress ? assets[assetAddress] : null;
});
