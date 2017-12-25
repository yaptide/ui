/* @flow */

import type { ChartLabels } from 'model/result/chart';
import type { Detector } from 'model/simulation/detector';

export function generateDetectorChartLabels(detector: Detector): ChartLabels {
  const _ = detector; // eslint-disable-line
  // TODO: replace mock after detector model is implemented.
  return {
    valueLabel: 'Energy',
    valueUnit: 'eV',
    dimensions: [
      { label: 'x', unit: 'mm', startValue: -20.050, endValue: -20.005 },
      { label: 'y', unit: 'mm', startValue: -20, endValue: 110 },
      { label: 'z', unit: 'mm', startValue: -20, endValue: 110 },
    ],
  };
}

