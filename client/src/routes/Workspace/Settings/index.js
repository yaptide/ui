/* flow */

const settingsRoute = {
  path: 'settings',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceSettingsContainer').default);
    }, 'workspaceSettingsBoundle');
  },
};

export default settingsRoute;
