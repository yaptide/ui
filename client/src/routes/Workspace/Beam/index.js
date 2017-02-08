/* flow */

const beamRoute = {
  path: 'beam',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceBeamContainer').default);
    }, 'workspaceBeamBoundle');
  },
};

export default beamRoute;
