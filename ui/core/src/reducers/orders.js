import {
  resourceReducer,
} from 'redux-resource';
import {
  includedResources,
} from 'redux-resource-plugins';


export default resourceReducer('orders', {
  plugins: [includedResources],
});
