/* @flow */

import React from 'react';
import { t } from 'i18n';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import type { Project } from 'model/project';


type Props = {
  projectId: string,
  project: Project,
  goToProjectDetails: () => void,
  goToProjectEdit: () => void,
  style?: Object,
};

class ProjectListItemLayout extends React.Component {
  props: Props;

  render() {
    return (
      <Card style={this.props.style} zDepth={2} >
        <CardTitle
          actAsExpander
          showExpandableButton
          title={this.props.project.name}
        />
        <CardText expandable >
          {
            this.props.project.description
              .split('\n')
              .map((item, key) => <span key={key}>{item}<br /></span>)
          }
        </CardText>
        <CardActions>
          <RaisedButton
            primary
            label={t('project.showDetailsBtn')}
            onTouchTap={this.props.goToProjectDetails}
            href={`#/project/${this.props.projectId}`}
          />
          <RaisedButton
            primary
            label={t('project.projectEdit')}
            onTouchTap={this.props.goToProjectEdit}
            href={`#/project/edit/${this.props.projectId}`}
          />
        </CardActions>
      </Card>
    );
  }
}


export default ProjectListItemLayout;
