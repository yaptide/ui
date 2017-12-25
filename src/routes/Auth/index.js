/* @flow */

import { redirectIfLoggedIn } from 'utils/router';

export { default as LoginForm } from './containers/LoginContainer';
export { default as RegisterForm } from './containers/RegisterContainer';

const authRoutes = {
  path: 'auth',
  getComponent(nextState: string, cb: Function) {
    require.ensure([], (require) => {
      cb(null, require('./layouts/AuthLayout').default);
    }, 'authBoundle');
  },
  childRoutes: [
    {
      path: 'login',
      indexRoute: { onEnter: redirectIfLoggedIn('/project/list') },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/LoginContainer').default);
        }, 'loginBoundle');
      },
    }, {
      path: 'register',
      indexRoute: { onEnter: redirectIfLoggedIn('project/list') },
      getComponent(nextState: string, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('./containers/RegisterContainer').default);
        }, 'registerBoundle');
      },
    },
  ],
};

export default authRoutes;
