/* @flow */

const geometryRoute = {
  path: 'geometry',
  getComponent(nextState: string, cb: Function) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceGeometryContainer').default);
    }, 'workspaceGeometryBoundle');
  },
};

export default geometryRoute;
