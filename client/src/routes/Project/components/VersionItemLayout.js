/* @flow */

import React from 'react';
import Style from 'styles';
import { t } from 'i18n';
import { Card, CardActions, CardText } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import type { Version } from 'model/project';
import { mapSimulationStateToColor } from '../enum';

type Props = {
  loadIntoWorkspace: () => void,
  buttonHandlers: Array<{
    handler: () => void,
    label: string,
  }>,
} & Version;

class VersionItemLayout extends React.Component {
  props: Props;

  render() {
    const buildStatusColor = mapSimulationStateToColor[this.props.status];
    const buttons = this.props.buttonHandlers.map((button, index) => {
      return (
        <RaisedButton
          key={index}
          label={button.label}
          onTouchTap={button.handler}
        />
      );
    });
    return (
      <Card style={styles.container} zDepth={2}>
        <CardText>
          <p style={styles.infoText} >{t('project.version.number', { number: this.props.id })}</p>
          <div style={styles.infoText} >
            {t(
              'project.version.status',
              { statusInfo: t(`project.versionStatus.${this.props.status}`) },
            )}
            { ['running', 'pending'].includes(this.props.status)
                ? <CircularProgress size={14} style={styles.loader} />
                : null
            }
          </div>
          <p style={styles.infoText} >
            {t(
              'project.version.library',
              { library: t(`library.${this.props.settings.computingLibrary}`) })
            }
          </p>
          <p style={styles.infoText} >
            {t(
              'project.version.engine',
              { engine: t(`engine.${this.props.settings.simulationEngine}`) })
            }
          </p>
        </CardText>
        <CardActions>
          <RaisedButton
            primary
            label={t('project.version.loadIntoWorkspace')}
            onTouchTap={this.props.loadIntoWorkspace}
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
  infoText: {
    paddingBottom: Style.Dimens.spacing.min,
  },
  loader: {
    paddingLeft: Style.Dimens.spacing.small,
    bottom: '-3px',
  },
};

export default VersionItemLayout;
