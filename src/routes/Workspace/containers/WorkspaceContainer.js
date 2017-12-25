/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { CircularProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
import router from 'utils/router';
import WorkspaceLayout from '../components/WorkspaceLayout';
import WorkspaceEditorLayout from '../components/WorkspaceEditorLayout';
import selector from '../selector';
import { actionCreator } from '../reducer';

type Props = {
  projectId: string,
  versionId: number,
  isWorkspaceLoading?: bool,
  isSyncPending?: bool,
  viewOnly: bool,
  isProject: bool,
  isLoggedIn: bool,
  isSimulationStarting: bool,
  isSimulationValid: bool,

  syncWorkspace: () => void,
  startSimulation: (projectId: string, versionId: number) => void,

  fetchSimulationSetup: () => void,
  children: React$Element<*>,
  location: { pathname: string },
  classes: Object,
}

type State = {
  isWorkspaceDropDownOpen: bool,
}

class WorkspaceContainer extends React.Component<Props, State> {
  props: Props;
  state: State = {
    isWorkspaceDropDownOpen: false,
  }

  componentWillMount() {
    this.props.fetchSimulationSetup();
  }

  startSimulation = () => {
    this.props.startSimulation(this.props.projectId, this.props.versionId);
  }

  toggleDropDown = () => {
    this.setState({ isWorkspaceDropDownOpen: !this.state.isWorkspaceDropDownOpen });
  }

  backToProject = () => {
    const { projectId, versionId } = this.props;
    if (projectId && (versionId !== undefined || versionId !== null)) {
      router.push(`/project/${projectId}`);
    }
  }

  render() {
    const { isWorkspaceLoading, children, classes } = this.props;
    return (
      <WorkspaceLayout
        isSyncPending={this.props.isSyncPending}
        viewOnly={this.props.viewOnly}
        isLoggedIn={this.props.isLoggedIn}
        isProject={this.props.isProject}
        isSimulationStarting={this.props.isSimulationStarting}
        isSimulationValid={this.props.isSimulationValid}

        backToProject={this.backToProject}
        startSimulation={this.startSimulation}
        syncWorkspace={this.props.syncWorkspace}
        toggleDropDown={this.toggleDropDown}

        activeWorkspaceTab={this.props.location.pathname}
        isWorkspaceDropDownOpen={this.state.isWorkspaceDropDownOpen}
      >
        {
          isWorkspaceLoading
            ? (
              <div className={classes.container}>
                <CircularProgress size={70} />
              </div>
            )
            : (
              <WorkspaceEditorLayout>
                {children}
              </WorkspaceEditorLayout>
            )
        }
      </WorkspaceLayout>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
};

const mapStateToProps = (state) => {
  return {
    projectId: state.workspace.get('projectId'),
    versionId: state.workspace.get('versionId'),
    isWorkspaceLoading: selector.isWorkspaceLoading(state),
    isSyncPending: state.workspace.get('isServerSyncPending'),
    viewOnly: state.workspace.get('viewOnly'),
    isProject: state.workspace.get('projectId') && state.workspace.get('versionId') !== undefined,
    isLoggedIn: !!state.auth.get('token'),
    isSimulationStarting: selector.isSimulationStarting(state),
    isSimulationValid: selector.isSimulationValid(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSimulationSetup: () => dispatch(actionCreator.fetchSimulationSetup()),
    syncWorkspace: () => dispatch(actionCreator.syncServerWithLocal()),
    startSimulation: (project, version) => dispatch(
      actionCreator.startSimulation(project, version),
    ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(WorkspaceContainer));

