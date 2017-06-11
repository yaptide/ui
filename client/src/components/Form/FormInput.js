/* @flow */

import React from 'react';
import TextField from 'material-ui/TextField';

type Props = {
  type: string,
  onChange: (any, string) => void,
  secureTextEntry?: bool,
  numbersOnly?: bool,
  value: string | number,
};

class FormInput extends React.Component {
  props: Props;

  onChange = (e: { target: { value: number|string }}) => {
    this.props.onChange(e.target.value, this.props.type);
  }

  render() {
    const {
      onChange,
      type,
      secureTextEntry,
      numbersOnly,
      ...inputProps
    } = this.props;

    let inputType = 'text';
    inputType = secureTextEntry ? 'password' : inputType;
    inputType = numbersOnly ? 'number' : inputType;

    return (
      <TextField
        {...inputProps}
        onChange={this.onChange}
        type={inputType}
      />
    );
  }
}

export default FormInput;
