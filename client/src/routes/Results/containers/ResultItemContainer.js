/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import router from 'utils/router';
import type { DetectorResultsInfo, DetectorResultId } from 'model/result';
import ResultItemLayout from '../components/ResultItemLayout';
import selector from '../selector';

type Props = {
  projectId: string,
  versionId: string,
  detectorId: DetectorResultId,
  detectorOverview: DetectorResultsInfo,
  style?: Object,
}

class ResultItemContainer extends React.Component {
  props: Props

  goToDetectorScore = () => {
    const { projectId, versionId, detectorId } = this.props;
    router.push(`/result/${detectorId}/${projectId}/${versionId}`);
  }

  render() {
    return (
      <ResultItemLayout
        detectorOverview={this.props.detectorOverview}
        goToDetectorScore={this.goToDetectorScore}
        style={this.props.style}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    detectorOverview: selector.resultOverviewSelector(state, props.detectorId),
    projectId: state.results.get('projectId'),
    versionId: state.results.get('versionId'),
  };
};

export default connect(
  mapStateToProps,
)(ResultItemContainer);
