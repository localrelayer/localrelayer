import {
  resourceReducer,
} from 'redux-resource';
import { multipleLists } from './plugins';

export default resourceReducer('orders', {
  plugins: [multipleLists],
});
