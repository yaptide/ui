/* @flow */

import React from 'react';
import * as _ from 'lodash';
import type { ChartLabels1D } from 'model/result/chart';
import Style from 'styles';
import Plotly from './Plotly';

type Props = {
  width: number,
  height: number,
  data: Array<number>,
  labels: ChartLabels1D,
}

class LineChart extends React.Component {
  props: Props;
  ref: any
  indices: Array<number> = [];
  values: Array<number> = [];

  constructChart = () => {
    this.evaluateValues();
    this.evaluateIndices();

    Plotly.plot(
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
        xaxis: {
          ...styles.layout.xaxis,
          title: `${this.props.labels.axis.label} [${this.props.labels.axis.unit}]`,
        },
        yaxis: {
          ...styles.layout.yaxis,
          title: `${this.props.labels.valueLabel} [${this.props.labels.valueUnit}]`,
        },
      },
    );
  }

  evaluateValues = () => { this.values = this.props.data; }
  evaluateIndices = () => {
    const { endValue, startValue } = this.props.labels.axis;
    this.indices = _.map(this.props.data, (value, index) => (
      startValue + ((index * (endValue - startValue)) / this.props.data.length)
    ));
  };


  setRef = (ref: any) => {
    if (!ref) return;
    this.ref = ref;
    this.constructChart();
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
    paper_bgcolor: Style.Theme.palette.canvasColor,
    plot_bgcolor: Style.Theme.palette.canvasColor,
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
        bgcolor: Style.Theme.palette.canvasDarkColor,
        bordercolor: Style.Theme.palette.primary1Color,
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
