// @flow
import rootSaga from 'instex-core/src/sagas';
import configureStore from './store/configureStore';

const store = configureStore();
store.runSaga(rootSaga);

export default store;
