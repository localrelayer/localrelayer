// @flow
import rootSaga from './sagas';
import configureStore from './store/configureStore';

const store = configureStore();
store.runSaga(rootSaga);

export default store;
