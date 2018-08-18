import moment from 'moment';

const tokens = [
  { address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c', symbol: 'WETH', decimals: 18, name: 'Ether Token' },
  { address: '0x09b9dfa83d424ab67b959bd17d46f7b30b277387', symbol: 'ZRX', decimals: 18, name: '0x Protocol' },
];

export default tokens.map((token, i) => ({
  ...token,
  created_at: moment().add(i, 'days'),
  is_listed: true,
}));
