/* @flow */

import { fork, call } from 'redux-saga/effects';
import authSaga from 'routes/Auth/saga';
import projectSaga from 'routes/Project/saga';
import workspaceSaga from 'routes/Workspace/saga';
import resultsSaga from 'routes/Results/saga';
import { configurationSaga } from './server_configuration';

import { initSaga } from './init';

export default function* rootSaga(): Generator<*, *, *> {
  yield call(initSaga);
  yield [
    fork(authSaga),
    fork(projectSaga),
    fork(workspaceSaga),
    fork(resultsSaga),
    fork(configurationSaga),
  ];
}
