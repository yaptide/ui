/* @flow */

import AppLayout from 'pages/AppLayout';

const projectRoute = {
  path: 'project',
  component: AppLayout,
  childRoutes: [
    {
      path: 'list',
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ProjectListContainer').default);
        }, 'projectListBoundle');
      },
    },
    {
      path: 'details',
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ProjectDetailsContainer').default);
        }, 'projectDetailsBoundle');
      },
    },
  ],
};

export default projectRoute;
