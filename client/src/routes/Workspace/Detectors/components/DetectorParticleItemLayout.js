/* @flow */

import React from 'react';
import type { ScoredParticle } from 'model/simulation/detector';
import { FormSelect, FormV3DoubleInput } from 'components/Form';
import { withStyles } from 'material-ui/styles';
import { t } from 'i18n';

type Props = {
  particle: ScoredParticle,
  particleUpdate: (updated: ScoredParticle) => void,
  classes: Object,
}

const options = [
  { field: 'charge', label: t('workspace.editor.charge') },
  { field: 'nucleonsCount', label: t('workspace.editor.nucleons') },
];
class DetectorParticleItemLayout extends React.Component<Props> {
  props: Props

  particleUpdate = (field: string, particle: Object) => {
    this.props.particleUpdate(particle);
  }

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
        <FormSelect
          type="type"
          value={this.props.particle.type}
          label={t('workspace.editor.particleType')}
          onChange={this.particleUpdate}
          options={[{ field: 'heavy_ion', label: 'Heavy Ion' }]}
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

export default withStyles(styles)(DetectorParticleItemLayout);
