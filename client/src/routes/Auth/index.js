/* flow */


const authRoutes = {
  path: 'auth',
  childRoutes: [
    {
      path: 'login',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          cb(null, require('./containers/LoginContainer').default);
        }, 'loginBoundle');
      },
    }, {
      path: 'register',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          cb(null, require('./containers/RegisterContainer').default);
        }, 'registerBoundle');
      },
    },
  ],
};

export default authRoutes;
