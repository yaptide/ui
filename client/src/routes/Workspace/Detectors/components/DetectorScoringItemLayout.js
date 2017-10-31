/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { ScoringType } from 'model/simulation/detector';
import { FormSelect, FormV3SingleInput } from 'components/Form';
import { withStyles } from 'material-ui/styles';
import { t } from 'i18n';
import * as _ from 'lodash';
import selector from '../../selector';

type Props = {
  scoring: ScoringType,
  scoringOptions: Array<{value: string, name: string}>,
  scoringUpdate: (updated: ScoringType) => void,
  classes: Object,
}

const options = { field: 'material', label: t('workspace.editor.material') };
class DetectorScoringItemLayout extends React.Component<Props> {
  props: Props

  scoringUpdate = (value: any, type: string) => {
    this.props.scoringUpdate({
      ...this.props.scoring,
      [type]: value,
    });
  }

  mapParticleOptions = () => {
    return _.map(
      this.props.scoringOptions,
      item => ({ field: item.value, label: item.name }),
    );
  }

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
        <FormSelect
          type="type"
          value={this.props.scoring.type}
          label={t('workspace.editor.scoringType')}
          onChange={this.scoringUpdate}
          options={this.mapParticleOptions()}
          classes={{ root: classes.item }}
        />
        {
          (false: any) &&
            <FormV3SingleInput
              field="scoring"
              rowLabel={t('workspace.editor.scoringOptions')}
              values={this.props.scoring}
              valueLabel={options}
              onUpdate={this.scoringUpdate}
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
    scoringOptions: selector.allScoringTypesPrintable(state).toJS(),
  };
};

export default connect(
  mapStateToProps,
)(withStyles(styles)(DetectorScoringItemLayout));
