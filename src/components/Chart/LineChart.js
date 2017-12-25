/* @flow */

import React from 'react';
import * as _ from 'lodash';
import type { ChartLabels1D } from 'model/result/chart';
import Plotly from './Plotly';

type Props = {
  width: number,
  height: number,
  data: Array<number>,
  labels: ChartLabels1D,
}

class LineChart extends React.Component<Props> {
  props: Props;

  componentDidMount() {
    this.constructChart(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    this.constructChart(newProps);
  }

  ref: any
  indices: Array<number> = [];
  values: Array<number> = [];

  constructChart = (props: Props) => {
    this.evaluateValues(props);
    this.evaluateIndices(props);

    Plotly.newPlot(
      this.ref,
      [
        {
          type: 'scatter',
          y: this.values,
          x: this.indices,
        },
      ],
      {
        ...styles.layout,
        width: props.width,
        height: props.height,
        xaxis: {
          ...styles.layout.xaxis,
          title: `${props.labels.axis.label} [${props.labels.axis.unit}]`,
        },
        yaxis: {
          ...styles.layout.yaxis,
          title: `${props.labels.valueLabel} [${props.labels.valueUnit}]`,
        },
      },
    );
  }

  evaluateValues = (props: Props) => { this.values = props.data; }
  evaluateIndices = (props: Props) => {
    const { endValue, startValue } = this.props.labels.axis;
    this.indices = _.map(props.data, (value, index) => (
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
    plot_bgcolor: '#333333',
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
        bordercolor: '#333333',
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

export default LineChart;
