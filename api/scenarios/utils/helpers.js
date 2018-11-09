import BigNumber from '../../BigNumber';

export const getRandomFutureDateInSeconds = (
) => BigNumber(Date.now() + 1000000).div(900).ceil();
