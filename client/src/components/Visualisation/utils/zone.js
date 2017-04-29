/* @flow */

import type { OperationType } from 'routes/Workspace/model';
import { Map } from 'immutable';
import ThreeBSP from 'ThreeCSG';
import geometryTypeMapping from './body';

export function processZone(
  zone: Map<string, any>,
  bodies: Map<string, Object>,
): Object {
  const initialBody = getBSPBody(bodies, zone.get('baseId'));
  const initialPosition = initialBody && initialBody.position && {
    x: initialBody.position.x,
    y: initialBody.position.y,
    z: initialBody.position.z,
  };
  let agregateBSP = initialBody && new ThreeBSP(initialBody);
  if (!agregateBSP) {
    return {};
  }
  zone.get('construction', []).forEach((item) => {
    const type = item.get('type');
    const bodyBSP = getBSPBody(bodies, item.get('bodyId'));
    agregateBSP = applyOperation(agregateBSP, bodyBSP, type);
  });

  return { zone: agregateBSP, position: initialPosition };
}

export function getBSPBody(bodies: Map<string, any>, bodyId: number): ?Object {
  const body = bodies.get(String(bodyId));
  return body ? generateBSPBody(body.toJS()) : undefined;
}

export function generateBSPBody(body: Object): ?Object {
  const bodyView = geometryTypeMapping[body.geometry.type](body.geometry);
  return bodyView;
}

export function applyOperation(base: ?Object, body: ?Object, operation: OperationType): ?Object {
  return base && body
    ? base[operation](new ThreeBSP(body))
    : undefined;
}

