/* @flow */

const nameMapping = {
  cuboid: 'CUBOID',
  sphere: 'SPHERE',
  cylinder: 'CYLINDER',
};

const XYZVector = (val: { x: number, y: number, z: number }) => {
  return `(${val.x}, ${val.y}, ${val.z})`;
};

const fieldOptions = [
  { field: 'radius', handler: (val: string) => `R(${val})` },
  { field: 'height', handler: (val: string) => `H(${val})` },
  { field: 'center', handler: (val: Object) => `C${XYZVector(val)}` },
  { field: 'size', handler: (val: Object) => `S${XYZVector(val)}` },
  { field: 'baseCenter', handler: (val: Object) => `B${XYZVector(val)}` },
];


function serializeBody(body: any) {
  if (!body || !body.geometry || !body.geometry.type) return '----';
  const name = nameMapping[body.geometry.type];
  const fields = fieldOptions
    .filter(item => body.geometry[item.field] !== undefined)
    .map(item => item.handler(body.geometry[item.field]))
    .join(', ');
  return `${name}: ${fields}`;
}

export default serializeBody;
