/* @flow */

import React from 'react';
import { t } from 'i18n';
import Card, { CardActions, CardHeader, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import type { Project } from 'model/project';

type Props = {
  projectId: string,
  project: Project,
  goToProjectDetails: () => void,
  goToProjectEdit: () => void,
  classes: Object,
};

class ProjectItemLayout extends React.Component<Props> {
  props: Props;

  render() {
    const classes = this.props.classes;
    return (
      <Card className={classes.root} elevation={4} >
        <CardHeader
          title={this.props.project.name}
        />
        <CardContent>
          <Typography>
            {
              this.props.project.description
                .split('\n')
                .map((item, key) => <span key={key}>{item}<br /></span>)
            }
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            color="primary"
            raised
            onTouchTap={this.props.goToProjectDetails}
            href={`#/project/${this.props.projectId}`}
          >
            {t('project.showDetailsBtn')}
          </Button>
          <Button
            color="primary"
            raised
            onTouchTap={this.props.goToProjectEdit}
            href={`#/project/edit/${this.props.projectId}`}
          >
            {t('project.projectEdit')}
          </Button>
        </CardActions>
      </Card>
    );
  }
}

const styles = () => ({
  root: {},
});

export default withStyles(styles)(ProjectItemLayout);
