/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import type { SimulationOptions } from 'model/simulation/options';
import { FormInput, FormSelect, FormSwitch } from 'components/Form';
import { t } from 'i18n';

type Props = {
  options: SimulationOptions,
  updateOptionsField: (field: string, value: any) => void,
  classes: Object,
}

const scatteringTypeOptions = [
  { label: 'Gaussian', field: 'gaussian' },
  { label: 'Moliere', field: 'moliere' },
];

const energyStragglingOptions = [
  { label: 'Gaussian', field: 'gaussian' },
  { label: 'Vavilov', field: 'vavilov' },
];

class WorkspaceOptionsLayout extends React.Component<Props> {
  props: Props

  updateByType = (value: any, type: string) => {
    this.props.updateOptionsField(type, value);
  }

  render() {
    const { options, classes } = this.props;
    return (
      <div className={classes.root} >
        <Paper className={classes.item} >
          <FormSwitch
            type="antyparticleCorrectionOn"
            checked={options.antyparticleCorrectionOn}
            label={t('workspace.editor.antyparticleCorrection')}
            onChange={this.updateByType}
          />
          <FormSwitch
            type="nuclearCorectionOn"
            checked={options.nuclearCorectionOn}
            label={t('workspace.editor.nuclearCorection')}
            onChange={this.updateByType}
          />

          <FormInput
            type="meanEnergyLoss"
            value={options.meanEnergyLoss}
            label={t('workspace.editor.meanEnergyLoss')}
            numbersOnly
            onChange={this.updateByType}
          />

          <FormInput
            type="minEnergyLoss"
            value={options.minEnergyLoss}
            label={t('workspace.editor.minEnergyLoss')}
            numbersOnly
            onChange={this.updateByType}
          />
          <FormSelect
            type="scatteringType"
            value={options.scatteringType}
            label={t('workspace.editor.scatteringType')}
            options={scatteringTypeOptions}
            onChange={this.updateByType}
          />
          <FormSelect
            type="energyStraggling"
            value={options.energyStraggling}
            label={t('workspace.editor.energyStraggling')}
            options={energyStragglingOptions}
            onChange={this.updateByType}
          />

          <FormSwitch
            type="fastNeutronTransportOn"
            checked={options.fastNeutronTransportOn}
            label={t('workspace.editor.fastNeutronTransport')}
            onChange={this.updateByType}
          />

          <FormInput
            type="lowEnergyNeutronCutOff"
            value={options.lowEnergyNeutronCutOff}
            label={t('workspace.editor.lowEnergyNeutronCutOff')}
            numbersOnly
            onChange={this.updateByType}
          />
          <FormSwitch
            type="recordSecondaryNeutronCreation"
            checked={options.recordSecondaryNeutronCreation}
            label={t('workspace.editor.recordSecondaryNeutronCreation')}
            onChange={this.updateByType}
          />

          <FormInput
            type="numberOfGeneratedParticles"
            value={options.numberOfGeneratedParticles}
            label={t('workspace.editor.numberOfGeneratedParticles')}
            numbersOnly
            onChange={this.updateByType}
          />

          <FormInput
            type="numberOfRecordedParticles"
            value={options.numberOfRecordedParticles}
            label={t('workspace.editor.numberOfRecordedParticles')}
            numbersOnly
            onChange={this.updateByType}
          />
        </Paper>
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    margin: theme.spacing.unit,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flexStart',
  },
  item: {
    flex: '0 0 100%',
    margin: theme.spacing.unit,
    padding: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  stretched: {
    display: 'flex',
    flexDirection: 'row',
  },
});

export default withStyles(styles)(WorkspaceOptionsLayout);
