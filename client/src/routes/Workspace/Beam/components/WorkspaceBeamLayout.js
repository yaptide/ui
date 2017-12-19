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
  { label: 'x [cm]', field: 'x' },
  { label: 'y [cm]', field: 'y' },
  { label: 'z [cm]', field: 'z' },
];

const angleDirection = [
  { label: 'φ [rad]', field: 'phi' },
  { label: 'θ [rad]', field: 'theta' },
];

const distributionSigma = [
  { label: 'x axis σ [cm]', field: 'sigmaX' },
  { label: 'y axis σ [cm]', field: 'sigmaY' },
];

const particleInitialEnergies = [
  { label: t('simulation.energyBase'), field: 'initialBaseEnergy' },
  { label: t('simulation.energySigma'), field: 'initialEnergySigma' },
];

const distributionOptions = [
  { label: '', field: '' },
  { label: 'Gaussian', field: 'gaussian' },
  { label: 'Flat', field: 'flat' },
];

function filterConcreteParticles(options) {
  return [] && options.filter(option => option.value !== 'all');
}

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
          <form>
            <ParticleEditor
              particle={beam.particleType}
              particleOptions={filterConcreteParticles(particleOptions)}
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
            <FormV3Input
              field="position"
              numbersOnly
              rowLabel={t('simulation.positionLabel')}
              valueLabels={coordinateValueLabels}
              values={beam.direction && beam.direction.position}
              valueError={{}}
              onUpdate={this.updateDirection}
            />
            <FormV3DoubleInput
              field="direction"
              numbersOnly
              rowLabel={t('workspace.editor.angle')}
              valueLabels={angleDirection}
              values={beam.direction}
              valueError={{}}
              onUpdate={this.props.updateBeamField}
            />
            <FormSelect
              fullWidth
              type="distribution"
              value={beam.divergence.distribution}
              label={t('workspace.editor.distribution')}
              options={distributionOptions}
              onChange={this.updateDistribution}
            />
            <FormV3DoubleInput
              field="divergence"
              numbersOnly
              rowLabel={t('simulation.distributionParameters')}
              valueLabels={distributionSigma}
              values={beam.divergence}
              valueError={{}}
              onUpdate={this.props.updateBeamField}
            />
          </form>
        </Paper>
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
  },
  item: {
    marginTop: theme.spacing.unit * 2,
    '&:first-child': {
      marginTop: 0,
    },
    padding: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(WorkspaceBeamLayout);
