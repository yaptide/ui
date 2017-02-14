/* @flow */

import React from 'react';
import Style from 'styles';

type Props = {
  onClick: (?string|number) => void,
  type?: string,
  btnText?: string,
  styles?: Object,
}

class FormButton extends React.Component {
  props: Props

  onClick = () => {
    this.props.onClick(this.props.type);
  }

  render() {
    const { onClick, btnText, ...props } = this.props;
    return (
      <button
        style={{ ...styles.button, ...this.props.styles }}
        onClick={this.onClick}
        {...props}
      >
        {btnText}
      </button>
    );
  }
}


const styles = {
  button: {
    height: Style.Dimens.spacing.large,
  },
};

export default FormButton;
