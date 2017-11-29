/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import type { Beam } from 'model/simulation/beam';
import type { Particle, Distribution } from 'model/simulation/utils';
import ParticleEditor from 'components/Editor/ParticleEditor';
import { FormV3Input, FormV3DoubleInput, FormSelect } from 'components/Form';
import { t } from 'i18n';

type Props = {
  beam: Beam,
  updateBeamField: (field: string, value: any) => void,
  particleOptions: Array<{value: string, name: string}>,
  classes: Object,
}

const coordinateValueLabels = [
  { label: 'x', field: 'x' },
  { label: 'y', field: 'y' },
  { label: 'z', field: 'z' },
];

const angleDirection = [
  { label: 'φ', field: 'phi' },
  { label: 'θ', field: 'theta' },
];

const distributionSigma = [
  { label: 'x axis σ', field: 'sigmaX' },
  { label: 'y axis σ', field: 'sigmaY' },
];

const particleInitialEnergies = [
  { label: t('workspace.editor.energyBase'), field: 'initialBaseEnergy' },
  { label: t('workspace.editor.energyDeviation'), field: 'initialEnergySigma' },
];

const distributionOptions = [
  { label: 'Gaussian', field: 'gaussian' },
  { label: 'Flat', field: 'flat' },
];

class WorkspaceBeamLayout extends React.Component<Props> {
  props: Props
  updateParticle = (particle: Particle) => {
    this.props.updateBeamField('particleType', particle);
  }
  updateDirection = (field: string, value: any) => {
    this.props.updateBeamField('direction', {
      ...this.props.beam.direction,
      [field]: value,
    });
  }

  updateDistribution = (distribution: Distribution) => {
    this.props.updateBeamField('divergence', {
      ...this.props.beam.divergence,
      distribution,
    });
  }

  updateInitialEnergy = (field: string, value: Object) => {
    const beam = this.props.beam;
    if (value.initialBaseEnergy !== beam.initialBaseEnergy) {
      this.props.updateBeamField('initialBaseEnergy', value.initialBaseEnergy);
    } else if (value.initialEnergySigma !== beam.initialEnergySigma) {
      this.props.updateBeamField('initialEnergySigma', value.initialEnergySigma);
    }
  }

  render() {
    const { beam, particleOptions, classes } = this.props;
    return (
      <div className={classes.root} >
        <Paper className={classes.item} >
          <FormV3DoubleInput
            field="direction"
            numbersOnly
            rowLabel={t('workspace.editor.angle')}
            valueLabels={angleDirection}
            values={beam.direction}
            valueError={{}}
            onUpdate={this.props.updateBeamField}
          />
          <FormV3Input
            field="position"
            numbersOnly
            rowLabel={t('workspace.editor.position')}
            valueLabels={coordinateValueLabels}
            values={beam.direction && beam.direction.position}
            valueError={{}}
            onUpdate={this.updateDirection}
          />
        </Paper>
        <Paper className={classes.item} >
          <FormSelect
            type="distribution"
            value={beam.divergence.distribution}
            label={t('workspace.editor.distribution')}
            options={distributionOptions}
            onChange={this.updateDistribution}
          />
          <FormV3DoubleInput
            field="divergence"
            numbersOnly
            rowLabel={t('workspace.editor.distributionParameters')}
            valueLabels={distributionSigma}
            values={beam.divergence}
            valueError={{}}
            onUpdate={this.props.updateBeamField}
          />
        </Paper>
        <Paper className={classes.item} >
          <ParticleEditor
            particle={beam.particleType}
            particleOptions={particleOptions}
            particleUpdate={this.updateParticle}
          />
          <FormV3DoubleInput
            field="beam"
            numbersOnly
            rowLabel={t('workspace.editor.initialEnergy')}
            valueLabels={particleInitialEnergies}
            values={beam}
            valueError={{}}
            onUpdate={this.updateInitialEnergy}
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

export default withStyles(styles)(WorkspaceBeamLayout);
