import AppLayout from '../pages/AppLayout';

const routes = {
  path: '/',
  component: AppLayout,
  getChildRoutes(location, cb) {
    require.ensure([], (require) => {
      cb(null, [
        // Remove imports!
      ]);
    });
  },
};

export default routes;
