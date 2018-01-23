import {
  call,
  put,
  fork,
} from 'redux-saga/effects';
import {
  fetchResourcesRequest,
} from './resources';
import {
  loadWeb3,
  connectionStatuses,
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';

import { runLoadUser } from './profile';
import * as uiActions from '../actions/ui';
import * as resourcesActions from '../actions/resources';


export function* initialize() {
  const responseTokens = yield call(
    fetchResourcesRequest,
    {
      payload: {
        resourceName: 'tokens',
        withDeleted: false,
      },
    },
  );
  const currentToken = responseTokens.data[0];
  yield put(uiActions.setCurrentToken(currentToken.id));
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      withDeleted: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'token.id': {
              eq: currentToken.id,
            },
          },
        },
      },
    }),
  );

  yield call(loadWeb3);

  if (!window.web3) {
    yield put(ProfileActions.setConnectionStatus(connectionStatuses.NOT_CONNECTED));
  } else {
    yield fork(runLoadUser);
  }
}
