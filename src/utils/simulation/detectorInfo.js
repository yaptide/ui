/* @flow */

import type { ChartLabels } from 'model/result/chart';
import type {
  Detector,
  Cylinder,
  Mesh,
  Geomap,
} from 'model/simulation/detector';

const dimensionsGenerators = {
  geomap: (geometry: Geomap) => ([
    {
      label: 'z',
      unit: 'cm',
      startValue: geometry.center.z - (geometry.size.z / 2),
      endValue: geometry.center.z + (geometry.size.z / 2),
    }, {
      label: 'y',
      unit: 'cm',
      startValue: geometry.center.y - (geometry.size.y / 2),
      endValue: geometry.center.y + (geometry.size.y / 2),
    }, {
      label: 'x',
      unit: 'cm',
      startValue: geometry.center.x - (geometry.size.x / 2),
      endValue: geometry.center.x + (geometry.size.x / 2),
    },
  ]),
  mesh: (geometry: Mesh) => ([
    {
      label: 'z',
      unit: 'cm',
      startValue: geometry.center.z - (geometry.size.z / 2),
      endValue: geometry.center.z + (geometry.size.z / 2),
    }, {
      label: 'y',
      unit: 'cm',
      startValue: geometry.center.y - (geometry.size.y / 2),
      endValue: geometry.center.y + (geometry.size.y / 2),
    }, {
      label: 'x',
      unit: 'cm',
      startValue: geometry.center.x - (geometry.size.x / 2),
      endValue: geometry.center.x + (geometry.size.x / 2),
    },
  ]),
  cylinder: (geometry: Cylinder) => ([
    {
      label: 'z',
      unit: 'cm',
      startValue: geometry.zValue.min,
      endValue: geometry.zValue.max,
    }, {
      label: 'θ',
      unit: 'rad',
      startValue: geometry.angle.min,
      endValue: geometry.angle.max,
    }, {
      label: 'R',
      unit: 'cm',
      startValue: geometry.radius.min,
      endValue: geometry.radius.max,
    },
  ]),
  plane: (() => []: any),
  zone: (() => []: any),
};

export function generateDetectorChartLabels(detector: Detector): ChartLabels {
  const type = detector.detectorGeometry.type;
  // TODO: replace mock after detector model is implemented.
  return {
    valueLabel: 'Energy',
    valueUnit: 'eV',
    dimensions: dimensionsGenerators[type]((detector.detectorGeometry: any)),
  };
}

