/* @flow */

import React from 'react';
import type { ScoringType } from 'model/simulation/detector';
import { FormSelect, FormV3SingleInput } from 'components/Form';
import { withStyles } from 'material-ui/styles';
import { t } from 'i18n';

type Props = {
  scoring: ScoringType,
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

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
        <FormSelect
          type="type"
          value={this.props.scoring.type}
          label={t('workspace.editor.scoringType')}
          onChange={this.scoringUpdate}
          options={[]}
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

export default withStyles(styles)(DetectorScoringItemLayout);
