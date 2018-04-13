import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 5000 });
BigNumber.config({ DECIMAL_PLACES: 8 });

export default BigNumber;
