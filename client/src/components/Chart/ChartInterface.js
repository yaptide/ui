/* @flow */

import React from 'react';
import * as _ from 'lodash';
import type { ChartLabels } from 'model/result/chart';
import LineChart from './LineChart';
import Heatmap from './Heatmap';
import ResizeHOC from '../Utils/ResizeHOC';

type Props = {
  data: Array<Array<Array<number>>>,
  numberOfDimensions: number,
  width: number,
  height: number,
  labels: ChartLabels,
}

class ChartInterface extends React.Component {
  props: Props

  render1DChart = () => {
    const data = _.flattenDeep(this.props.data);
    let axisLabel = { label: 'unknown', unit: 'unknown', startValue: 0, endValue: 100 };
    if (this.props.data.length > 1) {
      axisLabel = this.props.labels.dimensions[0];
    } else if (this.props.data[0].length > 1) {
      axisLabel = this.props.labels.dimensions[1];
    } else if (this.props.data[0][0].length > 1) {
      axisLabel = this.props.labels.dimensions[2];
    }
    return (
      <LineChart
        data={data}
        width={this.props.width}
        height={this.props.height}
        labels={{
          ...this.props.labels,
          axis: axisLabel,
        }}
      />
    );
  }

  render2DChart = () => {
    let data = [[0]];
    let axis1Label = { label: 'unknown', unit: 'unknown', startValue: 0, endValue: 100 };
    let axis2Label = { label: 'unknown', unit: 'unknown', startValue: 0, endValue: 100 };
    if (this.props.data.length === 1) {
      axis1Label = this.props.labels.dimensions[1];
      axis2Label = this.props.labels.dimensions[2];
      data = _.flatten(this.props.data);
    } else if (this.props.data[0].length > 1) {
      axis1Label = this.props.labels.dimensions[0];
      axis2Label = this.props.labels.dimensions[2];
      data = _.map(this.props.data, item => _.flatten(item));
    } else if (this.props.data[0][0].length > 1) {
      axis1Label = this.props.labels.dimensions[0];
      axis2Label = this.props.labels.dimensions[1];
      data = _.map(this.props.data, array2d => _.map(array2d, array1d => array1d[0]));
    }
    return (
      <Heatmap
        data={data}
        width={this.props.width}
        height={this.props.height}
        labels={{
          ...this.props.labels,
          axis1: axis1Label,
          axis2: axis2Label,
        }}
      />
    );
  }
  render() {
    const { numberOfDimensions } = this.props;
    if (numberOfDimensions === 3) {
      return <div>3D charts not implemented</div>;
    } else if (numberOfDimensions === 2) {
      return this.render2DChart();
    } else if (numberOfDimensions === 1) {
      return this.render1DChart();
    }
    return null;
  }
}

export default ResizeHOC(ChartInterface);
