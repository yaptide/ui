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
  label: string,
  onChange: (value: any, type: any) => void,
  options: Array<{ field: string, label: string }>,
  classes: Object,
};

type State = {
  open: bool,
  anchorEl: any,
};

class FormSelect extends React.Component<Props, State> {
  props: Props
  state: State = {
    open: false,
    anchorEl: undefined,
  }

  onChange = (event: any) => {
    this.props.onChange(event.target.value, this.props.type);
  }

  render() {
    const { value, options, label, classes } = this.props;
    return (
      <FormControl className={classes.root} >
        <InputLabel htmlFor="select">{label}</InputLabel>
        <Select
          onChange={this.onChange}
          value={value || ''}
          input={<Input id="select" />}
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
  root: {},
});

export default withStyles(styles)(FormSelect);
