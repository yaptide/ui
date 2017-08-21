/* @flow */

import React from 'react';
import * as _ from 'lodash';
import type { ChartLabels2D } from 'model/result/chart';
import Style from 'styles';
import Plotly from './Plotly';

type Props = {
  width: number,
  height: number,
  data: Array<Array<number>>,
  labels: ChartLabels2D,
}

class Heatmap extends React.Component {
  props: Props;
  ref: any
  indices1: Array<number> = [];
  indices2: Array<number> = [];
  values: Array<Array<number>> = [];

  constructChart = () => {
    this.evaluateValues();
    this.evaluateAxis1Indices();
    this.evaluateAxis2Indices();

    Plotly.plot(
      this.ref,
      [{
        x: this.indices1,
        y: this.indices2,
        z: this.values,
        type: 'heatmap',
      }],
      {
        ...styles.layout,
        xaxis: {
          ...styles.layout.xaxis,
          title: `${this.props.labels.axis1.label} [${this.props.labels.axis1.unit}]`,
          name: 'yaxis name',
        },
        yaxis: {
          ...styles.layout.yaxis,
          title: `${this.props.labels.axis2.label} [${this.props.labels.axis2.unit}]`,
        },
      },
    );
  }

  evaluateValues = () => { this.values = this.props.data; }
  evaluateAxis1Indices = () => {
    const { endValue, startValue } = this.props.labels.axis1;
    this.indices1 = _.map(this.props.data, (value, index) => (
      startValue + ((index * (endValue - startValue)) / this.props.data.length)
    ));
  };
  evaluateAxis2Indices = () => {
    const { endValue, startValue } = this.props.labels.axis2;
    this.indices2 = _.map(this.props.data[0], (value, index) => (
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

export default Heatmap;
