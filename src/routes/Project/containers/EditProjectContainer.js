/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { ProjectEditor } from 'components/Editor/ProjectEditor';
import type { Project } from 'model/project';
import ProjectEditorLayout from '../components/ProjectEditorLayout';
import { actionCreator } from '../reducer';
import selector from '../selector';

type Props = {
  project: Project,
  createProject: (project: Project) => void,
  fetchProjects: () => void,
};

type State = {
  name: string,
  description: string,
};

class EditProjectContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    name: '',
    description: '',
  }

  componentWillMount() {
    if (!this.props.project) {
      this.props.fetchProjects();
    } else {
      this.setState({
        name: this.props.project.name,
        description: this.props.project.description,
      });
    }
  }

  componentWillReceiveProps(props: Props) {
    if (!this.props.project && !!props.project) {
      this.setState({
        name: props.project.name,
        description: props.project.description,
      });
    }
  }

  updateProject = (value: string, type: string) => {
    this.setState({ [type]: value });
  }

  submit = () => {
    this.props.createProject(({
      name: this.state.name,
      description: this.state.description,
    }: any));
  }

  render() {
    return (
      <ProjectEditorLayout>
        <ProjectEditor
          name={this.state.name}
          description={this.state.description}
          updateProject={this.updateProject}
          submit={this.submit}
        />
      </ProjectEditorLayout>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    project: selector.projectSelector(state, props.params.projectId),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createProject: (project: Project) => (
      dispatch(actionCreator.updateProject(project, props.params.projectId))
    ),
    fetchProjects: () => dispatch(actionCreator.ensureProjects()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditProjectContainer);
