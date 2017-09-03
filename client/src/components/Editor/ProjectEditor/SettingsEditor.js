/* @flow */

import React from 'react';
import { t } from 'i18n';
import { FormSelect } from 'components/Form';
import type { ComputingLibrary, SimulationEngine } from 'model/project';
import Button from 'material-ui/Button';
import Style from 'styles';

type Props = {
  new?: bool,
  computingLibrary: ComputingLibrary,
  simulationEngine: SimulationEngine,
  updateSettings: (value: string, type: string) => void,
  submit: () => void,
}

class SettingsEditor extends React.Component<Props> {
  props: Props

  render() {
    return (
      <div style={styles.container} >
        <FormSelect
          type="computingLibrary"
          label={t('project.form.computingLibrary')}
          value={this.props.computingLibrary}
          onChange={this.props.updateSettings}
          options={computingLibraryOptions}
          fullWidth
        />
        <FormSelect
          type="simulationEngine"
          label={t('project.form.simulationEngine')}
          value={this.props.simulationEngine}
          options={simulationEngineOptions}
          onChange={this.props.updateSettings}
          fullWidth
        />
        <div style={styles.btnRow} >
          <Button
            onTouchTap={this.props.submit}
            color="primary"
            raised
          >
            {this.props.new ? t('project.form.createBtn') : t('project.form.updateBtn')}
          </Button>
        </div>
      </div>
    );
  }
}

const simulationEngineOptions: Array<{
  field: string, label: string,
}> = [
  { field: 'local', label: t('engine.local') },
];

const computingLibraryOptions: Array<{
  field: string, label: string,
}> = [
  { field: 'shield', label: t('library.shield') },
];

const styles = {
  container: {
    ...Style.Flex.rootColumn,
    alignItems: 'stretch',
    padding: Style.Dimens.spacing.normal,
  },
  textArea: {
  },
  btnRow: {
    ...Style.Flex.rootRow,
    justifyContent: 'flex-end',
  },
};

export default SettingsEditor;
