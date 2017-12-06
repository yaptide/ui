/* @flow */

import React from 'react';
import Input from 'material-ui/Input';
import InputLabel from 'material-ui/Input/InputLabel';
import FormControl from 'material-ui/Form/FormControl';
import FormHelperText from 'material-ui/Form/FormHelperText';
import { withStyles } from 'material-ui/styles';

type Props = {
  type?: string,
  label: string,
  errorText?: string,
  onChange: (any, string) => void,
  secureTextEntry?: bool,
  numbersOnly?: bool,

  classes: Object,
};

class FormInput extends React.Component<Props> {
  props: Props;

  onChange = (e: { target: { value: number|string }}) => {
    this.props.onChange(
      this.props.numbersOnly && !isNaN(Number(e.target.value)) && e.target.value
      ? Number(e.target.value)
      : e.target.value,
      this.props.type || '',
    );
  }

  render() {
    const {
      onChange,
      type,
      label,
      secureTextEntry,
      numbersOnly,
      errorText,
      classes,
      ...inputProps
    } = this.props;

    let inputType = 'text';
    inputType = secureTextEntry ? 'password' : inputType;
    inputType = numbersOnly ? 'number' : inputType;

    return (
      <FormControl error={!!errorText} className={classes.root} >
        <InputLabel htmlFor="formInput">{label}</InputLabel>
        <Input
          {...inputProps}
          id="formInput"
          onChange={this.onChange}
          type={inputType}
          inputProps={{ className: classes.input }}
        />
        <FormHelperText>{errorText}</FormHelperText>
      </FormControl>
    );
  }
}

const styles = {
  root: {
  },
  input: {
    margin: 1, // sometimes underline of input is invisible
  },
};

export default withStyles(styles)(FormInput);
