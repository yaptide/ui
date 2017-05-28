import expect from 'expect';
import Immutable from 'immutable';
import {
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  Mesh,
} from 'three';
import ThreeBSP from 'ThreeCSG';
import * as processor from '../../../src/components/Visualisation/geometryProcessor';

const validZone = Immutable.fromJS({
  zones: {
    1: { id: 1, name: 'zone 1', parentId: 1, children: [], materialId: 1, baseId: 1, construction: [{ type: 'subtract', bodyId: 2 }] },
  },
  bodies: {
    1: { id: 1, geometry: { type: 'sphere', center: { x: 5, y: 5, z: 5 }, radius: 3 } },
    2: { id: 2, geometry: { type: 'cylinder', height: 10, baseCenter: { x: 5, y: 0, z: 5 }, radius: 1 } },
  },
});

const expectedZone = (function expectedZone() {
  const body = new Mesh(new SphereGeometry(3));
  body.position.x = 5;
  body.position.y = 5;
  body.position.z = 5;
  const body2 = new Mesh(new CylinderGeometry(1, 1, 10));
  body2.position.x = 5;
  body2.position.y = 5;
  body2.position.z = 5;
  const result = new ThreeBSP(body).subtract(new ThreeBSP(body2));
  return [{
    zone: result,
    zoneData: validZone.getIn(['zones', '1']),
    color: '#0000FF',
    position: { x: 5, y: 5, z: 5 },
  }];
}());

const validZones = Immutable.fromJS({
  zones: {
    '1': { id: 1, name: 'zone 1', parentId: 1, children: [], materialId: 1, baseId: 1, construction: [{ type: 'subtract', bodyId: 2 }] },
    '2': { id: 2, name: 'zone 2', parentId: 2, children: [], materialId: 2, baseId: 3, construction: [{ type: 'intersect', bodyId: 4 }] },
  },
  bodies: {
    '1': { id: 1, geometry: { type: 'sphere', center: { x: 5, y: 5, z: 5 }, radius: 3 } },
    '2': { id: 2, geometry: { type: 'cylinder', height: 10, baseCenter: { x: 5, y: 0, z: 5 }, radius: 1 } },
    '3': { id: 3, geometry: { type: 'cuboid', center: { x: 5, y: -5, z: 5 }, size: { x: 2, y: 2, z: 2 } } },
    '4': { id: 4, geometry: { type: 'cuboid', center: { x: 5, y: -5, z: 5 }, size: { x: 3, y: 3, z: 3 } } },
  },
});

const expectedZones = (function expectedZones() {
  const body = new Mesh(new SphereGeometry(3));
  body.position.x = 5;
  body.position.y = 5;
  body.position.z = 5;
  const body2 = new Mesh(new CylinderGeometry(1, 1, 10));
  body2.position.x = 5;
  body2.position.y = 5;
  body2.position.z = 5;
  const result = new ThreeBSP(body).subtract(new ThreeBSP(body2));

  const body3 = new Mesh(new BoxGeometry(2, 2, 2));
  body3.position.x = 5;
  body3.position.y = -5;
  body3.position.z = 5;
  const result2 = new ThreeBSP(body3);
  return [
    { zone: result, zoneData: validZones.getIn(['zones', '1']), color: '#0000FF', position: { x: 5, y: 5, z: 5 } },
    { zone: result2, zoneData: validZones.getIn(['zones', '2']), color: '#00FF00', position: { x: 5, y: -5, z: 5 } },
  ];
}());

describe('Geometry visualisation data (all)', () => {
  it('Empty geometry on (Map({zones, bodies})', () => {
    const result = processor.processGeometry(Immutable.fromJS({
      zones: {},
      bodies: {},
    }));
    expect(result).toEqual([]);
  });

  it('Two zones and one is broken (udefined part of body construction)', () => {
    const brokenZone = validZones.setIn(['zones', '1', 'construction', 0, 'bodyId'], undefined);
    const result = processor.processGeometry(brokenZone);
    expect(result.length).toEqual(1);
  });

  it('Two zones and one is broken (udefined baseId construction)', () => {
    const brokenZone = validZones.setIn(['zones', '1', 'baseId'], undefined);
    const result = processor.processGeometry(brokenZone);
    expect(result.length).toEqual(1);
  });

  it('Two zones and one is broken (udefined bodies)', () => {
    const brokenZone = validZones
      .deleteIn(['bodies', '1'])
      .deleteIn(['bodies', '2']);
    const result = processor.processGeometry(brokenZone);
    expect(result.length).toEqual(1);
  });


  it('Single correct zone', () => {
    const result = processor.processGeometry(validZone);
    expect(result).toEqual(expectedZone);
  });

  it('Two correct zones', () => {
    const result = processor.processGeometry(validZones);
    expect(result).toEqual(expectedZones);
  });


  it('Invalid data(no body for zone))', () => {
    const result = processor.processGeometry(Immutable.fromJS({
      zones: { 1: { id: 1, baseId: 2 } },
      bodies: {},
    }));
    expect(result).toEqual([]);
  });

  it('Invalid data(undefined baseId))', () => {
    const result = processor.processGeometry(Immutable.fromJS({
      zones: { 1: { id: 1, baseId: undefined } },
      bodies: {},
    }));
    expect(result).toEqual([]);
  });

  it('Invalid data(undefined construction step))', () => {
    const result = processor.processGeometry(Immutable.fromJS({
      zones: { 1: { id: 1, baseId: undefined, construction: [{ type: 'subtract', bodyId: undefined }] } },
      bodies: {},
    }));
    expect(result).toEqual([]);
  });

  it('Invalid data(Map())', () => {
    processor.processGeometry(Immutable.Map());
  });
});

