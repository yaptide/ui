/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import WorkspaceLayout from 'pages/WorkspaceLayout';
import WorkspaceGeometryLayout from '../components/WorkspaceGeometryLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  isWorkspaceLoading: bool,
  fetchSimulationSetup: () => void,
}

class WorkspaceGeometryContainer extends React.Component<Props> {
  props: Props

  componentWillMount() {
    this.props.fetchSimulationSetup();
  }

  render() {
    return (
      <WorkspaceLayout
        activeWorkspaceTab="geometry"
        isWorkspaceLoading={this.props.isWorkspaceLoading}
      >
        { this.props.isWorkspaceLoading ? null : <WorkspaceGeometryLayout /> }
      </WorkspaceLayout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isWorkspaceLoading: selector.isWorkspaceLoading(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSimulationSetup: () => dispatch(actionCreator.fetchSimulationSetup()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WorkspaceGeometryContainer);
