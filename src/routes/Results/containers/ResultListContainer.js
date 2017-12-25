/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { DetectorResultId } from 'model/result';
import { LoadingCircle } from 'pages/Empty';
import ResultListLayout from '../components/ResultListLayout';
import selector from '../selector';
import { actionCreator } from '../reducer';

type Props = {
  detectorIds: Array<DetectorResultId>,
  isFetchPending: bool,
  fetchResults: () => void,
}

class ResultListContainer extends React.Component<Props> {
  props: Props

  componentWillMount() {
    this.props.fetchResults();
  }

  render() {
    if (this.props.isFetchPending || !this.props.detectorIds) {
      return (
        <LoadingCircle />
      );
    }
    return (
      <ResultListLayout
        detectorIds={this.props.detectorIds}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    detectorIds: selector.resultsListSelector(
      state,
      props.params.projectId,
      props.params.versionId,
    ),
    isFetchPending: state.results.get('isResultFetchPending'),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchResults: () => (
      dispatch(actionCreator.fetchResuts(props.params.projectId, props.params.versionId))
    ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResultListContainer);
