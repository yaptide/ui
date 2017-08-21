/* @flow */

export type ChartLabels = {
  valueLabel: string,
  valueUnit: string,
  dimensions: Array<AxisLabel>,
};

export type ChartLabels1D = {
  valueLabel: string,
  valueUnit: string,
  axis: AxisLabel,
};

export type ChartLabels2D = {
  valueLabel: string,
  valueUnit: string,
  axis1: AxisLabel,
  axis2: AxisLabel,
};

export type ChartLabels3D = {
  valueLabel: string,
  valueUnit: string,
  axis1: AxisLabel,
  axis2: AxisLabel,
  axis3: AxisLabel,
};

export type AxisLabel = {
  label: string,
  unit: string,
  startValue: number,
  endValue: number,
};
