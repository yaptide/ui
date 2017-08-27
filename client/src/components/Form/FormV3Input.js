/* @flow */

import React from 'react';
import Style from 'styles';
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
}

class FormV3Input extends React.Component {
  props: Props

  onUpdate = (value: string | number, type: string) => {
    this.props.onUpdate(this.props.field, {
      ...this.props.values,
      [type]: this.props.numbersOnly && value !== '' ? Number(value) : value,
    });
  }

  render() {
    return (
      <RowLabel label={this.props.rowLabel} >
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
              style={styles.inputWrapper}
            />
          ))
        }
      </RowLabel>
    );
  }
}

const styles = {
  inputRow: {
    ...Style.Flex.rootRow,
  },
  inputWrapper: {
    marginRight: Style.Dimens.spacing.normal,
    flex: '1 0 0',
  },
};

export default FormV3Input;
