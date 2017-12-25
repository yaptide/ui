/* @flow */

import React from 'react';
import { FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import { withStyles } from 'material-ui/styles';

type Props = {
  type?: string,
  label: string,
  checked: bool,
  onChange: (any, string) => void,

  classes: Object,
};

class FormSwitch extends React.Component<Props> {
  props: Props;

  onChange = (event: any, checked: bool) => {
    this.props.onChange(checked, this.props.type || '');
  }

  render() {
    const { label, checked, classes } = this.props;
    return (
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={this.onChange}
          />
        }
        label={label}
        className={classes.root}
      />
    );
  }
}

const styles = {
  root: {
  },
};

export default withStyles(styles)(FormSwitch);
