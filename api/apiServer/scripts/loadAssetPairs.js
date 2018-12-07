import '../../aliases';
import mainAssetPairs from 'utils/seeds/assetPairs.main';
import kovanAssetPairs from 'utils/seeds/assetPairs.kovan';
import testAssetPairs from 'utils/seeds/assetPairs.test';
import {
  AssetPair,
} from 'db';

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
  process.exit();
})();
