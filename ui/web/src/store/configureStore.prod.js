import createSagaMiddleware, { END } from 'redux-saga';
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';

import history from '../history';
import rootReducer from '../reducers';


const reduxRouterMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();
const middleware = [
  sagaMiddleware,
  reduxRouterMiddleware,
].filter(Boolean);


function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, compose(
    applyMiddleware(...middleware),
  ));

  store.runSaga = sagaMiddleware.run;
  store.close = () => store.dispatch(END);
  return store;
}

export default configureStore;
