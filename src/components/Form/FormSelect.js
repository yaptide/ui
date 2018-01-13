/* @flow */

import React from 'react';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles';

type Props = {
  type?: any,
  value: any,
  label: any,
  onChange: (value: any, type: any) => void,
  options: Array<{ field: string, label: string }>,
  fullWidth?: bool,
  classes: Object,
};

class FormSelect extends React.Component<Props> {
  props: Props

  onChange = (event: any) => {
    this.props.onChange(event.target.value, this.props.type);
  }

  render() {
    const { value, options, label, classes, fullWidth } = this.props;
    return (
      <FormControl
        className={classes.root}
        fullWidth={fullWidth}
      >
        <InputLabel htmlFor="select">{label}</InputLabel>
        <Select
          onChange={this.onChange}
          value={value || ''}
          input={<Input id="select" />}
          classes={{ select: classes.select }}
        >
          {
            options.map((item, index) => (
              <MenuItem
                key={index}
                value={item.field}
              >
                {item.label}
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>
    );
  }
}

const styles = () => ({
  root: {
  },
  select: {
    margin: 1, // sometimes underline of input is invisible
  },
});

export default withStyles(styles)(FormSelect);
