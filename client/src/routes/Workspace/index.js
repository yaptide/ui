/* @flow */

import Settings from './Settings';
import Beam from './Beam';
import Material from './Material';
import Geometry from './Geometry';
import Detectors from './Detectors';

const workspaceRoutes = {
  path: 'workspace',
  childRoutes: [
    Settings,
    Beam,
    Material,
    Geometry,
    Detectors,
  ],
};

export default workspaceRoutes;
