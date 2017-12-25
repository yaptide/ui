/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import DetectorsListLayout from '../components/DetectorsListLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  detectors: Array<number>,
  addDetector: () => void,
  classes?: Object,
}

class DetectorsListContainer extends React.Component<Props> {
  props: Props
  render() {
    return (
      <DetectorsListLayout
        detectors={this.props.detectors}
        addDetector={this.props.addDetector}
        classes={this.props.classes}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    detectors: selector.allDetectorsIds(state),
    geometry: selector.visualisationSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addDetector: () => dispatch(actionCreator.createDetector()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetectorsListContainer);
