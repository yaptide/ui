/* @flow */

import React from 'react';
import type { List } from 'immutable';
import Button from 'material-ui/Button';
import PlusIcon from 'material-ui-icons/Add';
import Style from 'styles';

import ProjectItemContainer from '../containers/ProjectItemContainer';

type Props = {
  projects: List<string>,
  createNewProject: () => void,
}

class ProjectListLayout extends React.Component {
  props: Props;

  render() {
    const projects = this.props.projects.map((id, index) => (
      <ProjectItemContainer
        key={index}
        projectId={id}
        style={styles.item}
      />
    ));
    return (
      <div style={styles.container}>
        <Button
          onTouchTap={this.props.createNewProject}
          style={styles.itemBtn}
          href="#/project/new"
        >
          <PlusIcon />
        </Button>
        {projects}
      </div>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.rootColumn,
    alignItems: 'stretch',
  },
  item: {
    margin: Style.Dimens.spacing.normal,
  },
  itemBtn: {
    margin: Style.Dimens.spacing.normal,
    marginBottom: '0px',
  },
};

export default ProjectListLayout;
