import moment from 'moment';
import tokens from './tokens.json';

export const tokensSpec = tokens.map((token, i) => ({
  ...token,
  created_at: moment().add(i, 'days'),
  is_listed: true,
}));
