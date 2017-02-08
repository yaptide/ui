/* flow */

const geometryRoute = {
  path: 'geometry',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./containers/WorkspaceGeometryContainer').default);
    }, 'workspaceGeometryBoundle');
  },
};

export default geometryRoute;
