/* @flow */

import React from 'react';
import Style from 'styles';
import Touchable from './Touchable';

type Props = {
  style?: {[string]: string},
  onClick: (type?: string) => void,
  title: string,
}

class Button extends React.Component<Props> {
  props: Props

  render() {
    const { style, ...props } = this.props;
    return (
      <Touchable
        style={{ ...styles.button, ...style }}
        {...props}
      />
    );
  }
}

const styles = {
  button: {
    outline: 'none',
    paddingTop: Style.Dimens.spacing.min,
    paddingBottom: Style.Dimens.spacing.min,
    marginLeft: Style.Dimens.spacing.min,
    marginRight: Style.Dimens.spacing.min,
    borderWidth: '0px',
    borderStyle: 'solid',
    borderRadius: Style.Dimens.spacing.min,
  },
};

export default Button;
