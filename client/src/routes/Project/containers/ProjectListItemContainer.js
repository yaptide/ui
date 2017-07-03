/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import router from 'utils/router';
import type { Project } from 'model/project';
import ProjectListItemLayout from '../components/ProjectListItemLayout';
import selector from '../selector';

type Props = {
  projectId: number,
  project: Project,
  style?: Object,
};

class ProjectListItemContainer extends React.Component {
  props: Props

  goToProjectDetails = () => {
    router.push(`/project/${this.props.projectId}`);
  }

  goToProjectEdit = () => {
    router.push(`/project/edit/${this.props.projectId}`);
  }

  render() {
    return (
      <ProjectListItemLayout
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
    project: selector.projectOverviewSelector(state, props.projectId),
  };
};

export default connect(
  mapStateToProps,
)(ProjectListItemContainer);
