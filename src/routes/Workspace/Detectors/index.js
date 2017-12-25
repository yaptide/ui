/* @flow */

const beamRoute = {
  path: 'detectors',
  getComponent(nextState: string, cb: Function) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceDetectorsContainer').default);
    }, 'workspaceDetectorsBoundle');
  },
};

export default beamRoute;
