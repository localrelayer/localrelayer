/*
this is integration test
we need this test only once, if cache file was changed
in order to check if everything is correct
*/
import {
  cachedTokens,
} from 'instex-core';
import {
  contracts,
} from 'instex-core';
import '../web3InitTests';

describe('tokensCache', () => {
  it('should check if additional info about tokens was calculated correctly', async () => {
    const addresses = Object.keys(cachedTokens.default);
    const extractInfo = async (contract) => {
      const name = await contract.methods.name().call();
      const symbol = await contract.methods.symbol().call();
      const decimals = await contract.methods.decimals().call();
      return {
        name,
        symbol,
        decimals,
      };
    };
    const getAdditionalInfo = async (address) => {
      try {
        // abiZRX
        const contract = new web3.eth.Contract(contracts.abiZRX, address);
        const additionalInfo = await extractInfo(contract);
        return { name: additionalInfo.name,
          symbol: additionalInfo.symbol,
          decimals: parseInt(additionalInfo.decimals, 10),
          address };
      } catch (error) {
        // abiEOS
        const contract = new web3.eth.Contract(contracts.abiEOS, address);
        const additionalInfo = await extractInfo(contract);
        const nameDecoded = await web3.utils.hexToAscii(additionalInfo.name).replace(/\u0000*$/, '');
        const symbolDecoded = await web3.utils.hexToAscii(additionalInfo.symbol).replace(/\u0000*$/, '');
        return { name: nameDecoded,
          symbol: symbolDecoded,
          decimals: parseInt(additionalInfo.decimals, 10),
          address };
      }
    };
    const tokensArray = await Promise.all(addresses.map(item => getAdditionalInfo(item)));
    const tokensCalculated = tokensArray.reduce((acc, curr) => {
      acc[curr.address] = curr;
      return acc;
    }, {});
    expect(cachedTokens.default).toMatchObject(tokensCalculated);
  });
});
