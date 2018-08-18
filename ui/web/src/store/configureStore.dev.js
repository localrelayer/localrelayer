import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import createSagaMiddleware, { END } from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { routerMiddleware } from 'react-router-redux';

import history from '../history';
import rootReducer from '../reducers';

const reduxRouterMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();
const middleware = [
  sagaMiddleware,
  reduxRouterMiddleware,
].filter(Boolean);

const composeEnhancers = composeWithDevTools({

});

function configureStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
    ),
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      // eslint-disable-next-line
      store.replaceReducer(require('../reducers').default);
    });
  }

  store.runSaga = sagaMiddleware.run;
  store.close = () => store.dispatch(END);
  return store;
}

export default configureStore;
