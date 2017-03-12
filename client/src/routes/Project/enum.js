/* @flow */

import Style from 'styles';
import { t } from 'i18n';

export const mapSimulationStateToColor = { // eslint-disable-line
  success: Style.Colors.green,
  error: Style.Colors.red,
  current: Style.Colors.yellow,
  none: Style.Colors.gray,
  inprogress: Style.Colors.gray,
};

export const mapActionsToVersionState = [
  {
    action: 'useVersion',
    condition: ['success', 'error'],
    label: t('project.version.useVersionBtn'),
  }, {
    action: 'showResults',
    condition: ['success'],
    label: t('project.version.showResultsBtn'),
  }, {
    action: 'showErrors',
    condition: ['error'],
    label: t('project.version.showErrorsBtn'),
  }, {
    action: 'startSimulation',
    condition: ['current'],
    label: t('project.version.startSimulationBtn'),
  }, {
    action: 'modifySettings',
    condition: ['current'],
    label: t('project.version.updateSettingBtn'),
  },
];

