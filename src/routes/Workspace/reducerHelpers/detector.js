/* @flow */

import { Map, fromJS } from 'immutable';
import type { Detector } from 'model/simulation/detector';

export function createDetector(
  state: Map<string, any>,
): Map<string, any> {
  const detectors = state.get('detectors');
  const newDetectorId: number = 1 + detectors.reduce((acc, val) => (val.get('id') > acc ? val.get('id') : acc), 0);
  const detectorImmutable = fromJS({
    id: newDetectorId,
    name: 'Unnamed detector',
    detectorGeometry: { type: '' },
    particle: { type: 'all' },
    scoring: { type: 'dose' },
  });
  return state.setIn(['detectors', String(newDetectorId)], detectorImmutable);
}

export function updateDetector(
  state: Map<string, any>,
  detector: Detector,
): Map<string, any> {
  const detectorImmutable = fromJS(detector);
  return state.setIn(['detectors', String(detector.id)], detectorImmutable);
}

export function deleteDetector(
  state: Map<string, any>,
  detectorId: number,
): Map<string, any> {
  return state.deleteIn(['detectors', String(detectorId)]);
}

export default {
  create: createDetector,
  update: updateDetector,
  delete: deleteDetector,
};
