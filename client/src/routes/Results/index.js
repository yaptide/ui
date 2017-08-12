/* @flow */

import { redirectIfUnlogged } from 'utils/router';
import AppLayout from 'pages/AppLayout';

const projectRoute = {
  path: 'result',
  component: AppLayout,
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
