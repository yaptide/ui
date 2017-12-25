/* @flow */

import Options from './Options';
import Beam from './Beam';
import Material from './Material';
import Geometry from './Geometry';
import Detectors from './Detectors';
import WorkspaceContainer from './containers/WorkspaceContainer';

const workspaceRoutes = {
  path: 'workspace',
  component: WorkspaceContainer,
  indexRoute: { onEnter: (nextState: string, replace: Function) => replace('/workspace/geometry') },
  childRoutes: [
    Options,
    Beam,
    Material,
    Geometry,
    Detectors,
  ],
};

export default workspaceRoutes;
