/* @flow */

import { redirectIfUnlogged } from 'utils/router';

const projectRoute = {
  path: 'result',
  childRoutes: [
    {
      path: 'list/:projectId/:versionId',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ResultListContainer').default);
        }, 'resultListBoundle');
      },
    }, {
      path: ':detectorId/:projectId/:versionId',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ResultDetailsContainer').default);
        }, 'resultDetailsBoundle');
      },
    },
  ],
};

export default projectRoute;
