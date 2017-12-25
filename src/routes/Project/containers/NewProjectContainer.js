/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { ProjectEditor } from 'components/Editor/ProjectEditor';
import type { Project } from 'model/project';
import ProjectEditorLayout from '../components/ProjectEditorLayout';
import { actionCreator } from '../reducer';

type Props = {
  createProject: (project: Project) => void,
};

type State = {
  name: string,
  description: string,
};

class NewProjectContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    name: '',
    description: '',
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
          new
          name={this.state.name}
          description={this.state.description}
          updateProject={this.updateProject}
          submit={this.submit}
        />
      </ProjectEditorLayout>
    );
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    createProject: (project: Project) => dispatch(actionCreator.createNewProject(project)),
  };
};

export default connect(
  null,
  mapDispatchToProps,
)(NewProjectContainer);
