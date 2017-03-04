/* @flow */

import React from 'react';
import type { List } from 'immutable';

import ProjectListItem from './ProjectListItem';

type Props = {
  projects: List<number>,
}

class ProjectListLayout extends React.Component {
  props: Props;

  render() {
    const projects = this.props.projects.map((e, i) => {
      return (
        <ProjectListItem key={i} projectId={e} />
      );
    });
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
