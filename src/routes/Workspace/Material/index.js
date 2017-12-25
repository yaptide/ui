/* @flow */

const materialRoute = {
  path: 'material',
  getComponent(nextState: string, cb: Function) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceMaterialContainer').default);
    }, 'workspaceMaterialBoundle');
  },
};

export default materialRoute;
