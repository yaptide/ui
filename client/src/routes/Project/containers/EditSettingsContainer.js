/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { SettingsEditor } from 'components/Editor/ProjectEditor';
import type { Settings, ComputingLibrary, SimulationEngine } from 'model/project';
import { LoadingCircle } from 'pages/Empty';
import ProjectEditorLayout from '../components/ProjectEditorLayout';
import { actionCreator } from '../reducer';
import selector from '../selector';

type Props = {
  settings: Settings,
  updateSettings: (settings: Settings) => void,
  fetchProjects: () => void,
  isFetchPending: bool,
}

class EditSettingsContainer extends React.Component {
  props: Props
  state: {
    computingLibrary: ComputingLibrary,
    simulationEngine: SimulationEngine,
  } = {
    computingLibrary: '',
    simulationEngine: '',
  }

  componentWillMount() {
    this.props.fetchProjects();
    if (this.props.settings) {
      this.setState({
        simulationEngine: this.props.settings.simulationEngine || '',
        computingLibrary: this.props.settings.computingLibrary || '',
      });
    }
  }

  componentWillReceiveProps(props: Props) {
    if (!props.settings) return;
    if (!this.props.settings ||
      this.props.settings.simulationEngine !== props.settings.simulationEngine ||
      this.props.settings.computingLibrary !== props.settings.computingLibrary
    ) {
      this.setState({
        computingLibrary: props.settings.computingLibrary,
        simulationEngine: props.settings.simulationEngine,
      });
    }
  }

  updateSettings = (value: string, type: string) => {
    this.setState({ [type]: value });
  }

  submit = () => {
    this.props.updateSettings({
      computingLibrary: this.state.computingLibrary,
      simulationEngine: this.state.simulationEngine,
    });
  }

  render() {
    if (this.props.isFetchPending) {
      return <LoadingCircle />;
    }

    return (
      <ProjectEditorLayout>
        <SettingsEditor
          computingLibrary={this.state.computingLibrary}
          simulationEngine={this.state.simulationEngine}
          updateSettings={this.updateSettings}
          submit={this.submit}
        />
      </ProjectEditorLayout>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    settings: selector.versionSettingsSelector(
      state, props.params.projectId, props.params.versionId,
    ),
    projectId: props.params.projectId,
    versionId: props.params.versionId,
    isFetchPending: state.project.get('isSettingsUpdatePending', false),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    updateSettings: (settings: Settings) => (
      dispatch(actionCreator.updateSettings(
        settings, props.params.projectId, props.params.versionId,
      ))
    ),
    fetchProjects: () => dispatch(actionCreator.ensureProjects()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditSettingsContainer);
