/* @flow */

import React from 'react';
import * as _ from 'lodash';
import type { ChartLabels2D } from 'model/result/chart';
import Plotly from './Plotly';

type Props = {
  width: number,
  height: number,
  data: Array<Array<number>>,
  labels: ChartLabels2D,
}

class Heatmap extends React.Component<Props> {
  props: Props;

  componentDidMount() {
    this.constructChart(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    this.constructChart(newProps);
  }

  ref: any
  indices1: Array<number> = [];
  indices2: Array<number> = [];
  values: Array<Array<number>> = [];

  constructChart = (props: Props) => {
    this.evaluateValues(props);
    this.evaluateAxis1Indices(props);
    this.evaluateAxis2Indices(props);

    Plotly.newPlot(
      this.ref,
      [{
        x: this.indices1,
        y: this.indices2,
        z: this.values,
        type: 'heatmap',
      }],
      {
        ...styles.layout,
        width: props.width,
        height: props.height,
        xaxis: {
          ...styles.layout.xaxis,
          title: `${props.labels.axis1.label} [${props.labels.axis1.unit}]`,
          name: 'yaxis name',
        },
        yaxis: {
          ...styles.layout.yaxis,
          title: `${props.labels.axis2.label} [${props.labels.axis2.unit}]`,
        },
      },
    );
  }

  evaluateValues = (props: Props) => { this.values = props.data; }
  evaluateAxis1Indices = (props: Props) => {
    const { endValue, startValue } = props.labels.axis1;
    this.indices1 = _.map(props.data, (value, index) => (
      startValue + ((index * (endValue - startValue)) / props.data.length)
    ));
  };
  evaluateAxis2Indices = (props: Props) => {
    const { endValue, startValue } = props.labels.axis2;
    this.indices2 = _.map(props.data[0], (value, index) => (
      startValue + ((index * (endValue - startValue)) / props.data.length)
    ));
  };

  setRef = (ref: any) => {
    if (!ref) return;
    this.ref = ref;
  }

  render() {
    return (
      <div ref={this.setRef} />
    );
  }
}

const styles = {
  layout: {
    margin: { t: 30 },
    paper_bgcolor: '#333333',
    font: {
      color: '#FFFFFF',
    },
    xaxis: {
      zeroline: true,
      zerolineColor: '#FFFFFF',
      color: '#FFFFFF',
      tickColor: '#FFFFFF',
      lineColor: '#FFFFFF',
      rangeselector: {
        bgcolor: '#333333',
        bordercolor: '#333399',
      },
    },
    yaxis: {
      color: '#FFFFFF',
      tickColor: '#FFFFFF',
      lineColor: '#FFFFFF',
      gridColor: '#00FFFF',
    },

  },
};

export default Heatmap;
