import expect from 'expect';
import Immutable from 'immutable';
import {
  SphereGeometry,
  CylinderGeometry,
  Mesh,
} from 'three';
import ThreeBSP from 'ThreeCSG';
import * as processor from '../../../src/components/Visualisation/utils/zone';

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
  return result;
}());

describe('Geometry visualisation data (body/zone)', () => {
  it('Invalid zone (udefined part of body construction)', () => {
    const brokenZone = validZone.setIn(['zones', '1', 'construction', 0, 'bodyId'], undefined);
    const result = processor.processZone(brokenZone.getIn(['zones', '1']), brokenZone.get('bodies'));
    expect(result).toEqual({ position: { x: 5, y: 5, z: 5 }, zone: undefined });
  });

  it('Invalid zone (udefined baseId construction)', () => {
    const brokenZone = validZone.setIn(['zones', '1', 'baseId'], undefined);
    const result = processor.processZone(brokenZone.getIn(['zones', '1']), brokenZone.get('bodies'));
    expect(result).toEqual({});
  });

  it('Invalid zones (udefined bodies)', () => {
    const result = processor.processZone(validZone.getIn(['zones', '1']), Immutable.Map());
    expect(result).toEqual({});
  });

  it.skip('Correct zone', () => {
    const result = processor.processZone(validZone.getIn(['zones', '1']), validZone.get('bodies'));
    expect(result).toEqual({ position: { x: 5, y: 5, z: 5 }, zone: expectedZone });
  });
});

