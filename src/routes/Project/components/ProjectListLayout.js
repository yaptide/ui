/* @flow */

import React from 'react';
import type { List } from 'immutable';
import Button from 'material-ui/Button';
import PlusIcon from 'material-ui-icons/Add';
import { withStyles } from 'material-ui/styles';
import AppLayout from 'pages/AppLayout';

import ProjectItemContainer from '../containers/ProjectItemContainer';

type Props = {
  projects: List<string>,
  createNewProject: () => void,
  classes: Object,
}

class ProjectListLayout extends React.Component<Props> {
  props: Props;

  render() {
    const classes = this.props.classes;
    const projects = this.props.projects.map((id, index) => (
      <ProjectItemContainer
        key={index}
        projectId={id}
        classes={{ root: classes.item }}
      />
    ));
    return (
      <AppLayout>
        <div className={classes.root}>
          <Button
            onTouchTap={this.props.createNewProject}
            className={classes.itemBtn}
            href="#/project/new"
            color="contrast"
            raised
          >
            <PlusIcon />
          </Button>
          {projects}
        </div>
      </AppLayout>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
    alignItems: 'stretch',
    padding: theme.spacing.unit * 4,
  },
  item: {
    marginBottom: theme.spacing.unit * 2,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  itemBtn: {
    marginBottom: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(ProjectListLayout);
