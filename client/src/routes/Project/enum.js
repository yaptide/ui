/* @flow */

import Style from 'styles';
import { t } from 'i18n';
import type { SimulationStatus } from 'model/project';

const newState: SimulationStatus = 'new';
const edited: SimulationStatus = 'edited';
const running: SimulationStatus = 'running';
const pending: SimulationStatus = 'pending';
const success: SimulationStatus = 'success';
const failure: SimulationStatus = 'failure';
const interrupted: SimulationStatus = 'interrupted';
const canceled: SimulationStatus = 'canceled';


export const mapSimulationStateToColor: {[SimulationStatus]: string} = {
  [success]: Style.Colors.green,
  [failure]: Style.Colors.red,
  [pending]: Style.Colors.yellow,
  [running]: Style.Colors.yellow,
  [interrupted]: Style.Colors.gray,
  [canceled]: Style.Colors.gray,
  [newState]: Style.Colors.gray,
  [edited]: Style.Colors.gray,
};

export const mapActionsToVersionState = [
  {
    action: 'useVersion',
    condition: [running, pending, success, failure, interrupted, canceled],
    label: t('project.version.useVersionBtn'),
  }, {
    action: 'showResults',
    condition: [success, failure],
    label: t('project.version.showResultsBtn'),
  }, {
    action: 'startSimulation',
    condition: [newState, edited, interrupted, canceled],
    label: t('project.version.startSimulationBtn'),
  }, {
    action: 'modifySettings',
    condition: [newState, edited, interrupted, canceled],
    label: t('project.version.updateSettingBtn'),
  },
];

