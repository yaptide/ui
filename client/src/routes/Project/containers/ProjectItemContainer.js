/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import router from 'utils/router';
import type { Project } from 'model/project';
import ProjectListItemLayout from '../components/ProjectItemLayout';
import selector from '../selector';

type Props = {
  projectId: string,
  project: Project,
  style?: Object,
};

class ProjectListItemContainer extends React.Component {
  props: Props

  goToProjectDetails = (e: any) => {
    e.preventDefault();
    if (e.nativeEvent.button !== 0) return;
    router.push(`/project/${this.props.projectId}`);
  }

  goToProjectEdit = (e: any) => {
    e.preventDefault();
    if (e.nativeEvent.button !== 0) return;
    router.push(`/project/edit/${this.props.projectId}`);
  }

  render() {
    return (
      <ProjectListItemLayout
        projectId={this.props.projectId}
        project={this.props.project}
        goToProjectDetails={this.goToProjectDetails}
        goToProjectEdit={this.goToProjectEdit}
        style={this.props.style}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    project: selector.projectSelector(state, props.projectId),
  };
};

export default connect(
  mapStateToProps,
)(ProjectListItemContainer);
