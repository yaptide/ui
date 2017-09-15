/* @flow */

import React from 'react';
import { RowLabel, FormSelect } from 'components/Form';
import { t } from 'i18n';
import { withStyles } from 'material-ui/styles';
import type { GeometryType } from 'model/simulation/body';

type Props = {
  type: GeometryType,
  onTypeChange: (type: GeometryType) => void,
  children?: any,
  classes: Object,
}

class GeometryForm extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <RowLabel
          label={t('workspace.editor.type')}
        >
          <FormSelect
            value={this.props.type}
            onChange={this.props.onTypeChange}
            options={options}
            classes={{ root: classes.select }}
          />
        </RowLabel>
        {this.props.children}
      </div>
    );
  }
}

const options = [
  { field: 'cuboid', label: t('workspace.typeLabel.cuboid') },
  { field: 'sphere', label: t('workspace.typeLabel.sphere') },
  { field: 'cylinder', label: t('workspace.typeLabel.cylinder') },
];

const styles = (theme: Object) => ({
  root: {
    paddingTop: theme.spacing.unit * 2,
    flex: '1 0 0',
  },
  select: {
    flex: '1 0 0',
    paddingRight: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(GeometryForm);
