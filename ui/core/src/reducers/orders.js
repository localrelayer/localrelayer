import {
  resourceReducer,
} from 'redux-resource';
import {
  includedResources,
} from 'redux-resource-plugins';
import {
  multipleLists,
} from './plugins';


export default resourceReducer('orders', {
  plugins: [includedResources, multipleLists],
});
