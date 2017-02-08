/* flow */

const materialRoute = {
  path: 'material',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceMaterialContainer').default);
    }, 'workspaceMaterialBoundle');
  },
};

export default materialRoute;
