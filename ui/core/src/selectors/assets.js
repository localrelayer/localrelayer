export const getAssetByIdField = ({
  fieldName,
  value,
}) => (assets) => {
  const assetAddress = Object.keys(assets)
    .find(address => (assets[address][fieldName] === value));

  return assetAddress ? assets[assetAddress] : null;
};
