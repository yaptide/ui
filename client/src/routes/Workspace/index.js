/* flow */

import Settings from './Settings';
import Beam from './Beam';
import Material from './Material';
import Geometry from './Geometry';

const workspaceRoutes = {
  path: 'workspace',
  childRoutes: [
    Settings,
    Beam,
    Material,
    Geometry,
  ],
};

export default workspaceRoutes;
