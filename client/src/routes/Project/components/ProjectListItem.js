/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Store } from 'store/reducers';
import { t } from 'i18n';
import Style from 'styles';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import selector from '../selector';

type Props = {
  projectId: string,
  project: {
    name: string,
    description: string,
  },
  goToProjectDetails: (string) => void,
};

class ProjectListItem extends React.Component {
  props: Props;

  goToProjectDetails = () => {
    this.props.goToProjectDetails(this.props.projectId);
  }

  render() {
    return (
      <Card style={styles.container} zDepth={2} >
        <CardTitle
          actAsExpander
          showExpandableButton
          title={this.props.project.name}
          subtitle="01-12-2017 - 03-10-2022"
        />
        <CardText expandable >
          {this.props.project.description}
        </CardText>
        <CardActions>
          <RaisedButton label={t('project.showDetailsBtn')} onTouchTap={this.goToProjectDetails} />
          <RaisedButton label={t('project.projectSettings')} />
        </CardActions>
      </Card>
    );
  }
}


const styles = {
  container: {
    margin: Style.Dimens.spacing.normal,
  },
  wrapper: {
    ...Style.Flex.rootRow,
  },
  buildStatus: {
  },
  cardContainer: {
    flex: '1 0 0',
  },
};

const mapStateToProps = (state: Store, props: { projectId: number }) => {
  return {
    project: selector.projectOverviewSelector(state, props.projectId),
  };
};

export default connect(
  mapStateToProps,
)(ProjectListItem);
