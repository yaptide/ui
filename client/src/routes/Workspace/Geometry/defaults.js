/* @flow */

const bodyDefaults = {
  cuboid() {
    return { center: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
  },
  sphere() {
    return { center: { x: 0, y: 0, z: 0 }, radius: 1 };
  },
  cylinder() {
    return { baseCenter: { x: 0, y: 0, z: 0 }, height: 1, radius: 1 };
  },
};

export function defaultBodyForType(type: string) {
  return bodyDefaults[type]();
}

