
import { redirectIfLoggedIn } from 'utils/router';

const staticPages = [
  {
    path: 'welcome',
    indexRoute: { onEnter: redirectIfLoggedIn('project/list') },
    getComponent(nextState: Object, cb: Function) {
      require.ensure([], (require) => {
        cb(null, require('pages/WelcomePage').default);
      }, 'welcomePageBundle');
    },
  }, {
    path: 'logout',
    getComponent(nextState: string, cb: Function) {
      require.ensure([], (require) => {
        cb(null, require('pages/StaticPage').Logout);
      }, 'logoutBoundle');
    },
  }, {
    path: 'help',
    getComponent(nextState: string, cb: Function) {
      require.ensure([], (require) => {
        cb(null, require('pages/StaticPage').Help);
      }, 'helpBoundle');
    },
  }, {
    path: 'about',
    getComponent(nextState: string, cb: Function) {
      require.ensure([], (require) => {
        cb(null, require('pages/StaticPage').About);
      }, 'aboutBoundle');
    },
  }, {
    path: 'page403',
    getComponent(nextState: string, cb: Function) {
      require.ensure([], (require) => {
        cb(null, require('pages/StaticPage').Page403);
      }, 'aboutBoundle');
    },
  }, {
    path: '*',
    getComponent(nextState: string, cb: Function) {
      require.ensure([], (require) => {
        cb(null, require('pages/StaticPage').Page404);
      }, 'aboutBoundle');
    },
  },
];

export default staticPages;
