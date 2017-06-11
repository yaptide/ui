/* @flow */

import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Style from 'styles';

type Props = {
  value: any,
  onChange: (value: any) => void,
  options: Array<{ field: string, label: string }>,
}

class FormSelect extends React.Component {
  props: Props

  onChange = (event: mixed, index: number, value: any) => {
    this.props.onChange(value);
  }

  render() {
    const { value, onChange, options, ...props } = this.props;
    return (
      <SelectField
        value={value}
        style={styles.select}
        onChange={this.onChange}
        {...props}
      >
        {
          options.map((item, index) => (
            <MenuItem
              key={index}
              value={item.field}
              primaryText={item.label}
            />
          ))
        }
      </SelectField>
    );
  }
}

const styles = {
  select: {
    marginRight: Style.Dimens.spacing.normal,
  },
};

export default FormSelect;
