/* @flow */

const optionsRoute = {
  path: 'options',
  getComponent(nextState: string, cb: Function) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceOptionsContainer').default);
    }, 'workspaceOptionsBoundle');
  },
};

export default optionsRoute;
