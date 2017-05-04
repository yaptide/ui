/* @flow */

import { redirectIfUnlogged } from 'utils/router';

import Auth from './Auth';
import Project from './Project';
import Workspace from './Workspace';
import staticPages from './staticPages';

const routes = {
  path: '/',
  indexRoute: { onEnter: (nextState: Object, replace: Function) => replace('/welcome') },
  childRoutes: [
    Auth,
    Project,
    Workspace,
    {
      path: 'account',
      indexRoute: { onEnter: redirectIfUnlogged() },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('routes/Auth/containers/AccountContainer').default);
        }, 'accountBoundle');
      },
    },
    ...staticPages,
  ],
};

export default routes;
