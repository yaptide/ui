/* @flow */

import React from 'react';
import { hashHistory } from 'react-router';
import Style from 'styles';
import { t } from 'i18n';
import * as _ from 'lodash';
import { Card, CardActions, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import type { Version } from 'model/project';
import { mapSimulationStateToColor, mapActionsToVersionState } from '../enum';

type Props = {
} & Version;

class ProjectVersionListItem extends React.Component {
  props: Props;

  btnHandlers = {
    useVersion: () => {

    },
    showResults: () => {

    },
    showErrors: () => {

    },
    startSimulation: () => {

    },
    modifySettings: () => {

    },
  }

  loadIntoWorkspace = () => {
    hashHistory.push('/workspace/geometry');
  }

  render() {
    const buildStatusColor = mapSimulationStateToColor[this.props.status];
    const buttons = mapActionsToVersionState.map((e, i) => {
      return _.includes(e.condition, this.props.status)
        ? <RaisedButton
          key={i}
          label={e.label}
          onTouchTap={this.btnHandlers[e.action]}
        />
        : null;
    });
    return (
      <Card style={styles.container} zDepth={2}>
        <CardText>
          <p>{t('project.version.number', { number: this.props.id })}</p>
          <p>
            {t(
              'project.version.status',
              { statusInfo: t(`project.versionStatus.${this.props.status}`) },
            )}
          </p>
          <p>{t('project.version.library', { library: t(`library.${this.props.settings.library}`) })}</p>
          <p>{t('project.version.engine', { engine: t(`engine.${this.props.settings.engine}`) })}</p>
        </CardText>
        <CardActions>
          <RaisedButton
            primary
            label={t('project.version.loadIntoWorkspace')}
            onTouchTap={this.loadIntoWorkspace}
          />
        </CardActions>
        <CardActions >
          {buttons}
        </CardActions>
        <div style={{ ...styles.buildStatus, background: buildStatusColor }} />
      </Card>
    );
  }
}

const styles = {
  container: {
    marginTop: Style.Dimens.spacing.normal,
    marginBottom: Style.Dimens.spacing.normal,
    paddingLeft: '30px',
    position: 'relative',
  },
  buildStatus: {
    width: '30px',
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
  },
};

export default ProjectVersionListItem;
