/* @flow */

const settingsRoute = {
  path: 'settings',
  getComponent(nextState: string, cb: Function) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceSettingsContainer').default);
    }, 'workspaceSettingsBoundle');
  },
};

export default settingsRoute;
