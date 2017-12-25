/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import router from 'utils/router';
import type { DetectorResultsInfo, DetectorResultId } from 'model/result';
import ResultItemLayout from '../components/ResultItemLayout';
import selector from '../selector';

type Props = {
  projectId: string,
  versionId: number,
  detectorId: DetectorResultId,
  detectorOverview: DetectorResultsInfo,
  classes?: Object,
}

class ResultItemContainer extends React.Component<Props> {
  props: Props

  goToDetectorScore = (e: any) => {
    e.preventDefault();
    if (e.nativeEvent.button !== 0) return;
    const { projectId, versionId, detectorId } = this.props;
    router.push(`/result/${detectorId}/${projectId}/${versionId}`);
  }

  render() {
    return (
      <ResultItemLayout
        projectId={this.props.projectId}
        versionId={this.props.versionId}
        detectorId={this.props.detectorId}
        detectorOverview={this.props.detectorOverview}
        goToDetectorScore={this.goToDetectorScore}
        classes={this.props.classes}
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
