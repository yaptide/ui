/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Particle } from 'model/simulation/utils';
import { FormSelect, FormV3DoubleInput } from 'components/Form';
import { withStyles } from 'material-ui/styles';
import * as _ from 'lodash';
import { t } from 'i18n';
import selector from '../../selector';

type Props = {
  particle: Particle,
  particleUpdate: (updated: Particle) => void,
  particleOptions: Array<{value: string, name: string}>,
  classes: Object,
}

const options = [
  { field: 'charge', label: t('workspace.editor.charge') },
  { field: 'nucleonsCount', label: t('workspace.editor.nucleons') },
];
class DetectorParticleItemLayout extends React.Component<Props> {
  props: Props

  particleTypeUpdate = (type: string) => {
    this.props.particleUpdate({
      ...(this.props.particle: Particle),
      type,
    });
  }
  particleUpdate = (field: string, particle: Object) => {
    this.props.particleUpdate(particle);
  }

  mapParticleOptions = () => {
    return _.map(
      this.props.particleOptions,
      item => ({ field: item.value, label: item.name }),
    );
  }

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
        <FormSelect
          type="type"
          value={this.props.particle.type}
          label={t('workspace.editor.particleType')}
          onChange={this.particleTypeUpdate}
          options={this.mapParticleOptions()}
          classes={{ root: classes.item }}
        />
        {
          this.props.particle.type === 'heavy_ion' &&
            <FormV3DoubleInput
              field="particle"
              rowLabel={t('workspace.editor.particleOptions')}
              values={this.props.particle}
              valueLabels={options}
              valueError={{}}
              onUpdate={this.particleUpdate}
              numbersOnly
            />
        }
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    marginBottom: theme.spacing.unit,
  },
});

const mapStateToProps = (state) => {
  return {
    particleOptions: selector.allScoredParticleTypesPrinatable(state).toJS(),
  };
};

export default connect(
  mapStateToProps,
)(withStyles(styles)(DetectorParticleItemLayout));
