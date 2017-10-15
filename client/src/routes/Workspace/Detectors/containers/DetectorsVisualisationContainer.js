/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import DetectorsVisualisationLayout from '../components/DetectorsVisualisationLayout';
import selector from '../../selector';

type Props = {
  geometry: any,
  classes?: Object,
};

class DetectorsVisualisationContainer extends React.Component<Props> {
  props: Props

  render() {
    return (
      <DetectorsVisualisationLayout
        geometry={this.props.geometry}
        classes={this.props.classes}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    geometry: selector.visualisationSelector(state),
  };
};

export default connect(
  mapStateToProps,
)(DetectorsVisualisationContainer);
