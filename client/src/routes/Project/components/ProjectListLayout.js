/* @flow */

import React from 'react';
import type { List } from 'immutable';

import ProjectListItem from './ProjectListItem';

type Props = {
  projects: List<number>,
  goToProjectDetails: (string) => void,
}

class ProjectListLayout extends React.Component {
  props: Props;

  render() {
    const projects = this.props.projects.map((e, i) => (
      <ProjectListItem
        key={i}
        projectId={e}
        goToProjectDetails={this.props.goToProjectDetails}
      />
    ));
    return (
      <div style={styles.container}>{projects}</div>
    );
  }
}

const styles = {
  container: {
    alignItems: 'stretch',
  },
};

export default ProjectListLayout;
