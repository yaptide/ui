/* @flow */

import React from 'react';
import Style from 'styles';
import { t } from 'i18n';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import type { Version } from 'model/project';
import { mapSimulationStateToColor } from '../enum';

type Props = {
  projectId: string,
  versionId: number,
  loadIntoWorkspace: () => void,
  buttonHandlers: Array<{
    handler: () => void,
    label: string,
    url: (projectId: string, versionId: number) => string,
  }>,
} & Version;

class VersionItemLayout extends React.Component {
  props: Props;

  render() {
    const { projectId, versionId } = this.props;

    const buildStatusColor = mapSimulationStateToColor[this.props.status];
    const buttons = this.props.buttonHandlers.map((button, index) => {
      return (
        <Button
          key={index}
          onTouchTap={button.handler}
          href={button.url(projectId, versionId)}
          raised
        >
          {button.label}
        </Button>
      );
    });
    return (
      <Card style={styles.container} elevation={4} >
        <CardContent>
          <Typography>{t('project.version.number', { number: this.props.id })}</Typography>
          <div style={styles.infoText} >
            <Typography>
              {t(
                'project.version.status',
                { statusInfo: t(`project.versionStatus.${this.props.status}`) },
              )}
            </Typography>
            { ['running', 'pending'].includes(this.props.status)
                ? <CircularProgress size={14} style={styles.loader} />
                : null
            }
          </div>
          <Typography>
            {t(
              'project.version.library',
              { library: t(`library.${this.props.settings.computingLibrary}`) })
            }
          </Typography>
          <Typography>
            {t(
              'project.version.engine',
              { engine: t(`engine.${this.props.settings.simulationEngine}`) })
            }
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            color="primary"
            raised
            onClick={this.props.loadIntoWorkspace}
            href={`#/project/${projectId}`}
          >
            {t('project.version.loadIntoWorkspace')}
          </Button>
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
    display: 'flex',
    flexDirection: 'row',
  },
  loader: {
    marginLeft: '15px',
    bottom: '-3px',
    width: '20px',
  },
};

export default VersionItemLayout;
