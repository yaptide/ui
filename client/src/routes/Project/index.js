/* @flow */

import { redirectIfUnlogged } from 'utils/router';
import AppLayout from 'pages/AppLayout';

const projectRoute = {
  path: 'project',
  component: AppLayout,
  childRoutes: [
    {
      path: 'list',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ProjectListContainer').default);
        }, 'projectListBoundle');
      },
    }, {
      path: 'new',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/NewProjectContainer').default);
        }, 'projectNewBoundle');
      },
    }, {
      path: 'edit/:projectId',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/EditProjectContainer').default);
        }, 'projectEditBoundle');
      },
    }, {
      path: ':projectId',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/ProjectDetailsContainer').default);
        }, 'projectDetailsBoundle');
      },
    }, {
      path: 'settings/:projectId/:versionId',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/EditSettingsContainer').default);
        }, 'settingsEditBoundle');
      },
    },
  ],
};

export default projectRoute;
