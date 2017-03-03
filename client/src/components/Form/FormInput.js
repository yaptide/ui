/* @flow */

import React from 'react';

import Style from 'styles';

type Props = {
  type: string,
  onChange: (any, string) => void,
  secureTextEntry?: bool,
  numbersOnly?: bool,
  value: string,
  inputStyle?: Object,
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
      inputStyle,
      ...inputProps
    } = this.props;

    let inputType = 'text';
    inputType = secureTextEntry ? 'password' : inputType;
    inputType = numbersOnly ? 'number' : inputType;

    return (
      <div style={{ ...styles.formWrapper, ...inputStyle }} >
        <input
          {...inputProps}
          onChange={this.onChange}
          type={inputType}
          style={styles.input}
        />
      </div>
    );
  }
}

const styles = {
  formWrapper: {
    ...Style.Flex.rootColumn,
  },
  input: {
    ...Style.Flex.elementEqual,
    height: Style.Dimens.spacing.large,
    paddingLeft: '8px',
  },
};

export default FormInput;
