/* @flow */

import React from 'react';
import { hashHistory } from 'react-router';
import Style from 'styles';
import { t } from 'i18n';
import * as _ from 'lodash';
import { Button } from 'components/Touchable';
import type { Version } from '../model';
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
        ? <Button
          key={i}
          title={e.label}
          onClick={this.btnHandlers[e.action]}
          style={styles.button}
        />
        : null;
    });
    return (
      <div style={styles.container}>
        <div style={{ ...styles.buildStatus, background: buildStatusColor }} />
        <div style={styles.detailsContainer} >
          <p>{t('project.version.number', { number: this.props.id })}</p>
          <p>
            {t(
              'project.version.status',
              { statusInfo: t(`project.versionStatus.${this.props.status}`) },
            )}
          </p>
          <p>{t('project.version.library', { library: t(`library.${this.props.settings.library}`) })}</p>
          <p>{t('project.version.engine', { engine: t(`engine.${this.props.settings.engine}`) })}</p>
        </div>
        <div style={styles.loadBtnContainer} >
          <Button
            title={t('project.version.loadIntoWorkspace')}
            onClick={this.loadIntoWorkspace}
            style={styles.button}
          />
        </div>
        <div style={styles.buttonsContainer} >
          {buttons}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.rootRow,
    alignItems: 'stretch',
    marginTop: Style.Dimens.spacing.normal,
    marginBottom: Style.Dimens.spacing.normal,
    border: '1px solid',
    borderColor: Style.Colors.gray,
    overflow: 'auto',
  },
  buildStatus: {
    width: Style.Dimens.spacing.normal,
  },
  detailsContainer: {
    flex: '6 0 0',
    overflow: 'hidden',
    padding: Style.Dimens.spacing.normal,
  },
  loadBtnContainer: {
    ...Style.Flex.rootRow,
    justifyContent: 'stretch',
    flex: '2 0 0',
    overflow: 'hidden',
    padding: Style.Dimens.spacing.normal,
    paddingTop: Style.Dimens.spacing.small,
  },
  buttonsContainer: {
    ...Style.Flex.rootColumn,
    justifyContent: 'stretch',
    flex: '4 0 0',
    overflow: 'hidden',
    padding: Style.Dimens.spacing.normal,
    paddingTop: Style.Dimens.spacing.small,
  },
  button: {
    padding: Style.Dimens.spacing.small,
    marginTop: Style.Dimens.spacing.small,
    background: Style.Colors.secondary,
    color: Style.Colors.white,
    fontSize: Style.Dimens.font.standard,
    fontWeight: 'bold',
  },
};

export default ProjectVersionListItem;
