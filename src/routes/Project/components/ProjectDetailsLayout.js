/* @flow */

import React from 'react';
import Style from 'styles';
import type { Project } from 'model/project';
import Button from 'material-ui/Button';
import IconAdd from 'material-ui-icons/Add';
import { withStyles } from 'material-ui/styles';
import AppLayout from 'pages/AppLayout';
import VersionItemContainer from '../containers/VersionItemContainer';

type Props = {
  createVersionFromLatest: () => void,
  project: Project,
  classes: Object,
};

class ProjectDetailsLayout extends React.Component<Props> {
  props: Props

  render() {
    const { classes, project } = this.props;
    const versions = project.versionIds.reverse().map((version, index) => {
      return (
        <VersionItemContainer
          key={version}
          versionId={version}
          projectId={project.id}
          classes={{ root: classes.item }}
          last={index == 0}
        />
      );
    });

    return (
      <AppLayout>
        <div className={classes.root}>
          <div className={classes.header}>
            <div className={classes.descriptionBlock}>
              <p className={classes.projectName}>{project.name}</p>
              <p className={classes.projectDescription}>
                {
                  project.description
                  .split('\n')
                  .map((item, key) => <span key={key}>{item}<br /></span>)
                }
              </p>
            </div>
            <Button
              onTouchTap={this.props.createVersionFromLatest}
              href={`#/project/${project.id}`}
              color="contrast"
              raised
            >
              <IconAdd />
            </Button>
          </div>
          {versions}
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
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descriptionBlock: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
    marginRight: Style.Dimens.spacing.normal,
  },
  projectName: {
    fontSize: Style.Dimens.font.large,
    color: theme.palette.grey[200],
    paddingBottom: Style.Dimens.spacing.normal,
  },
  projectDescription: {
    color: theme.palette.grey[200],
    fontSize: Style.Dimens.font.standard,
  },
  item: {
    marginBottom: theme.spacing.unit * 2,
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

export default withStyles(styles)(ProjectDetailsLayout);
