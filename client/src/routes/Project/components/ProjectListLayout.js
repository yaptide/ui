/* @flow */

import React from 'react';
import type { List } from 'immutable';
import RaisedButton from 'material-ui/RaisedButton';
import PlusIcon from 'material-ui/svg-icons/content/add';
import Style from 'styles';

import ProjectItemContainer from '../containers/ProjectItemContainer';

type Props = {
  projects: List<string>,
  createNewProject: () => void,
}

class ProjectListLayout extends React.Component {
  props: Props;

  render() {
    const projects = this.props.projects.map(id => (
      <ProjectItemContainer
        key={id}
        projectId={id}
        style={styles.item}
      />
    ));
    return (
      <div style={styles.container}>
        <RaisedButton
          onTouchTap={this.props.createNewProject}
          icon={<PlusIcon />}
          style={styles.itemBtn}
        />
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
