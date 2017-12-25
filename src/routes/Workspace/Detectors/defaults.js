/* @flow */

const detectorGeometryDefaults = {
  geomap() {
    return {
      type: 'geomap',
      center: { x: 0, y: 0, z: 0 },
      size: { x: 1, y: 1, z: 1 },
      slices: { x: 1, y: 1, z: 1 },
    };
  },
  cylinder() {
    return {
      type: 'cylinder',
      center: { x: 0, y: 0, z: 0 },
      radius: { min: 0, max: 1 },
      zValue: { min: 0, max: 1 },
      angle: { min: 0, max: Math.PI * 2 },
      slices: { radius: 1, angle: 1, z: 1 },
    };
  },
  mesh() {
    return {
      type: 'mesh',
      center: { x: 0, y: 0, z: 0 },
      size: { x: 1, y: 1, z: 1 },
      slices: { x: 1, y: 1, z: 1 },
    };
  },
  zone() {
    return {
      type: 'zone',
      zones: [],
    };
  },
  plane() {
    return {
      type: 'plane',
      point: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 0 },
      slices: { x: 1, y: 1, z: 1 },
    };
  },
};

export function defaultDetectorGeometryForType(type: string) {
  if (type) {
    return detectorGeometryDefaults[type]();
  }
  return ({}: any);
}

