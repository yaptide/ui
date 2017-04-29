/* @flow */

import * as BodyType from 'routes/Workspace/bodyModel';
import {
  Mesh,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
} from 'three';


const geometryTypeMapping = {
  cuboid(geometry: BodyType.CuboidGeometry): any {
    const body = new Mesh(new BoxGeometry(geometry.size.x, geometry.size.y, geometry.size.z));
    body.position.x = geometry.center.x;
    body.position.y = geometry.center.y;
    body.position.z = geometry.center.z;
    return body;
  },
  sphere(geometry: BodyType.SphereGeometry): any {
    const body = new Mesh(new SphereGeometry(geometry.radius));
    body.position.x = geometry.center.x;
    body.position.y = geometry.center.y;
    body.position.z = geometry.center.z;
    return body;
  },
  cylinder(geometry: BodyType.CylinderGeometry) {
    const body = new Mesh(new CylinderGeometry(
      geometry.radius, // radiusTop
      geometry.radius, // radiusBottom
      geometry.height, // height
    ));
    body.position.x = geometry.baseCenter.x;
    body.position.y = geometry.baseCenter.y + (geometry.height / 2);
    body.position.z = geometry.baseCenter.z;
    return body;
  },
};

export default geometryTypeMapping;
