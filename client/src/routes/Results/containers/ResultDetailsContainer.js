/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Score } from 'model/result';
import { LoadingCircle } from 'pages/Empty';
import ResultDetailsLayout from '../components/ResultDetailsLayout';
import selector from '../selector';
import { actionCreator } from '../reducer';

type Props = {
  scored: Score,
  isFetchPending: bool,
  fetchResults: () => void,
}

class ResultDetailsContainer extends React.Component {
  props: Props

  componentWillMount() {
    this.props.fetchResults();
  }

  render() {
    if (this.props.isFetchPending || !this.props.scored) {
      return (
        <LoadingCircle />
      );
    }
    return (
      <ResultDetailsLayout scored={this.props.scored} />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    scored: selector.resultScoreSelector(state, props.params.detectorId),
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
)(ResultDetailsContainer);
