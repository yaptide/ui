/* @flow */
import type { Body, BodyGeometry } from 'model/simulation/zone';
import type {
  GeometryType,
  CuboidGeometry,
  SphereGeometry,
  CylinderGeometry,
} from 'model/simulation/body';
import type { Vec3D } from 'model/simulation/utils';
import * as _ from 'lodash';

export const geometryTypes = ['cuboid', 'sphere', 'cylinder'];

export function validateBody(
  body: Body,
  { withId }: { withId?: bool} = {},
) {
  const result: { id?: string, geometry: Object } = { geometry: {} };
  if (withId) {
    validateBodyId.call(result, body.id);
  }
  validateGeometryType.call(result, body.geometry.type);
  validateGeometry.call(result, body.geometry);
  return result;
}

function validateBodyId(id: number) {
  if (id === undefined || id === null) {
    this.id = 'bodyId missing';
  }
}

function validateGeometryType(type: string) {
  if (!type) {
    this.geometry = { ...this.geometry, type: 'Missing geometry type' };
  }
  if (!geometryTypes.includes(type)) {
    this.geometry = {
      ...this.geometry,
      type: `Geometry type should be one of [${geometryTypes.join(', ')}]`,
    };
  }
}

function validateGeometry(body: BodyGeometry) {
  if (Object.keys(mapGeometryValidators).includes(body.type)) {
    mapGeometryValidators[body.type].call(this, body || {});
  }
}

const mapGeometryValidators: {[GeometryType]: Function} = {
  cuboid: validateCuboid,
  sphere: validateSphere,
  cylinder: validateCylinder,
};

function validateCuboid(geometry: CuboidGeometry) {
  const sizeExistError = helpers.existsXYZ(geometry.size);
  if (Object.keys(sizeExistError).length !== 0) {
    this.geometry = { ...this.geometry, size: sizeExistError };
  }
  const centerExistError = helpers.existsXYZ(geometry.center);
  if (Object.keys(centerExistError).length !== 0) {
    this.geometry = { ...this.geometry, center: centerExistError };
  }
  const sizeError = helpers.positiveXYZ(geometry.size);
  if (Object.keys(sizeError).length !== 0 && !this.geometry.size) {
    this.geometry = { ...this.geometry, size: sizeError };
  }
}

function validateSphere(geometry: SphereGeometry) {
  const centerExistError = helpers.existsXYZ(geometry.center);
  if (Object.keys(centerExistError).length !== 0) {
    this.geometry = { ...this.geometry, center: centerExistError };
  }
  const radiusExistError = helpers.exists(geometry.radius);
  if (radiusExistError) {
    this.geometry = { ...this.geometry, radius: radiusExistError };
  }
  const radiusError = helpers.positive(geometry.radius);
  if (radiusError && !this.geometry.radius) {
    this.geometry = { ...this.geometry, radius: radiusError };
  }
}

function validateCylinder(geometry: CylinderGeometry) {
  const centerExistError = helpers.existsXYZ(geometry.baseCenter);
  if (Object.keys(centerExistError).length !== 0) {
    this.geometry = { ...this.geometry, baseCenter: centerExistError };
  }
  const radiusExistError = helpers.exists(geometry.radius);
  if (radiusExistError) {
    this.geometry = { ...this.geometry, radius: radiusExistError };
  }
  const radiusError = helpers.positive(geometry.radius);
  if (radiusError && !this.geometry.radius) {
    this.geometry = { ...this.geometry, radius: radiusError };
  }
  const heightExistError = helpers.exists(geometry.height);
  if (heightExistError) {
    this.geometry = { ...this.geometry, height: heightExistError };
  }
  const heightError = helpers.positive(geometry.height);
  if (heightError && !this.geometry.height) {
    this.geometry = { ...this.geometry, height: heightError };
  }
}
const helpers = {
  positiveXYZ(value: Vec3D) {
    const errors = {};
    _.forEach(value || {}, (val, key) => {
      if (val <= 0) {
        errors[key] = 'required positive number';
      }
    });
    return errors;
  },
  existsXYZ(value: Vec3D) {
    const errors = {};
    _.forEach(value || {}, (val, key) => {
      if (val === undefined || val === null || val === '') {
        errors[key] = 'required value';
      }
    });
    return errors;
  },
  positive(value: number) {
    if (value <= 0) {
      return 'required positive number';
    }
    return undefined;
  },
  exists(value: number) {
    if (value === undefined || value === null || value === '') {
      return 'required value';
    }
    return undefined;
  },
};

export default validateBody;
