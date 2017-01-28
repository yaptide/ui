/* @flow */

import AppLayout from '../pages/AppLayout';

const routes = {
  path: '/',
  component: AppLayout,
  getChildRoutes(location: string, cb: Function) {
    require.ensure([], (require) => { //eslint-disable-line
      cb(null, [
        // Remove imports!
      ]);
    });
  },
};

export default routes;
