/* @flow */

import { redirectIfUnlogged } from 'utils/router';

const projectRoute = {
  path: 'project',
  childRoutes: [
    {
      path: 'list',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ProjectListContainer').default);
        }, 'projectListBoundle');
      },
    },
    {
      path: ':paramName',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ProjectDetailsContainer').default);
        }, 'projectDetailsBoundle');
      },
    },
  ],
};

export default projectRoute;
