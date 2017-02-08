/* @flow */
import Auth from './Auth';
import Project from './Project';
import Workspace from './Workspace';

const routes = {
  path: '/',
  indexRoute: { onEnter: (nextState: Object, replace: Function) => replace('/welcome') },
  childRoutes: [
    Auth,
    Project,
    Workspace,
    {
      path: 'welcome',
      getComponent(nextState: Object, cb: Function) {
        require.ensure([], (require) => {
          cb(null, require('pages/WelcomePage').default);
        }, 'welcomePageBundle');
      },
    },
  ],
};

export default routes;
