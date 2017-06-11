/* @flow */

import React from 'react';
import Style from 'styles';

type Props = {
  label: string,
  children?: React.Element<*>,
}

class RowLabel extends React.Component {
  props: Props

  render() {
    return (
      <div style={styles.inputRow}>
        <div style={styles.label}>
          <div style={styles.labelText}>{`${this.props.label}:`}</div>
        </div>
        <div style={styles.inputs}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

const styles = {
  inputRow: {
    ...Style.Flex.rootRow,
  },
  label: {
    ...Style.Flex.rootRow,
    flex: '1 0 0',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  inputs: {
    ...Style.Flex.rootRow,
    flex: '3 0 0',
  },
  labelText: {
    fontSize: Style.Dimens.font.large,
    marginBottom: '12px',
    color: Style.Colors.white,
    marginLeft: Style.Dimens.spacing.small,
  },
};

export default RowLabel;
