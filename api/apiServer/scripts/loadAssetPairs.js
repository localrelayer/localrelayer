import mainAssetPairs from '../../../ui/core/src/mocks/assetPairs.main';
import kovanAssetPairs from '../../../ui/core/src/mocks/assetPairs.kovan';
import testAssetPairs from '../../../ui/core/src/mocks/assetPairs.test';
import {
  AssetPair,
} from '../../db';

(async () => {
  const mainPairs = mainAssetPairs.map((pair) => {
    pair.networkId = 1;
    return pair;
  });
  await AssetPair.insertMany(mainPairs);
  const kovanPairs = kovanAssetPairs.map((pair) => {
    pair.networkId = 42;
    return pair;
  });
  await AssetPair.insertMany(kovanPairs);
  const testPairs = testAssetPairs.map((pair) => {
    pair.networkId = 50;
    return pair;
  });
  await AssetPair.insertMany(testPairs);
})();
