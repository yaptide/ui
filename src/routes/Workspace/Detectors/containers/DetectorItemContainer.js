/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Detector } from 'model/simulation/detector';
import DetectorItemLayout from '../components/DetectorItemLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';
import { defaultDetectorGeometryForType } from '../defaults';

type Props = {
  detector: Detector,
  updateDetector: (detector: Detector) => void,
  deleteDetector: () => void,
  particleOptions: Array<{value: string, name: string}>,
  classes?: Object,
}

const EMPTY = {};
class DetectorItemContainer extends React.Component<Props> {
  props: Props

  updateType = (type: string) => {
    this.props.updateDetector({
      ...this.props.detector,
      detectorGeometry: defaultDetectorGeometryForType(type),
    });
  }

  detectorNameUpdate = (name: string) => {
    this.props.updateDetector({
      ...this.props.detector,
      name,
    });
  }

  geometryUpdate = (type: string, value: any) => {
    this.props.updateDetector({
      ...this.props.detector,
      detectorGeometry: {
        ...(this.props.detector.detectorGeometry: any),
        [type]: value,
      },
    });
  }
  particleUpdate = (value: Object) => {
    this.props.updateDetector({
      ...this.props.detector,
      particle: {
        ...this.props.detector.particle,
        ...value,
      },
    });
  }

  scoringUpdate = (value: Object) => {
    this.props.updateDetector({
      ...this.props.detector,
      scoring: {
        ...this.props.detector.scoring,
        ...value,
      },
    });
  }

  render() {
    return (
      <DetectorItemLayout
        classes={this.props.classes}
        detector={this.props.detector || EMPTY}
        updateType={this.updateType}
        detectorNameUpdate={this.detectorNameUpdate}
        geometryUpdate={this.geometryUpdate}
        particleUpdate={this.particleUpdate}
        scoringUpdate={this.scoringUpdate}
        deleteDetector={this.props.deleteDetector}
        particleOptions={this.props.particleOptions}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    detector: selector.detectorById(state, props.detectorId).toJS(),
    particleOptions: selector.allScoredParticleTypesPrinatable(state).toJS(),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    updateDetector: detector => dispatch(actionCreator.updateDetector(detector)),
    deleteDetector: () => dispatch(actionCreator.deleteDetector(props.detectorId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetectorItemContainer);

