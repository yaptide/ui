/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import { FormInput } from 'components/Form';
import RowLabel from './RowLabel';

type Props = {
  field: string,
  numbersOnly?: bool,
  rowLabel: string,
  valueLabels: Array<{ label: string, field: string }>,
  values: Object,
  valueError: Object,
  onUpdate: (field: string, value: Object) => void,
  classes: Object,
}

class FormV3DoubleInput extends React.Component<Props> {
  props: Props

  onUpdate = (value: string | number, type: string) => {
    this.props.onUpdate(this.props.field, {
      ...this.props.values,
      [type]: this.props.numbersOnly && value !== '' ? Number(value) : value,
    });
  }

  render() {
    const classes = this.props.classes;
    return (
      <RowLabel
        label={this.props.rowLabel}
        classes={{ root: this.props.classes.root }}
      >
        {
          this.props.valueLabels.map((item, index) => (
            <FormInput
              key={index}
              type={item.field}
              label={item.label}
              onChange={this.onUpdate}
              value={this.props.values[item.field]}
              errorText={this.props.valueError[item.field]}
              numbersOnly={this.props.numbersOnly}
              classes={{ root: classes.inputWrapper }}
            />
          ))
        }
        <div className={classes.inputWrapper} />
      </RowLabel>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  inputWrapper: {
    marginRight: theme.spacing.unit * 2,
    flex: '1 1 0',
    '&:last-child': {
      marginRight: 0,
    },
  },
});

export default withStyles(styles)(FormV3DoubleInput);
