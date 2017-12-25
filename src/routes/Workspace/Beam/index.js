/* @flow */

const beamRoute = {
  path: 'beam',
  getComponent(nextState: string, cb: Function) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceBeamContainer').default);
    }, 'workspaceBeamBoundle');
  },
};

export default beamRoute;
