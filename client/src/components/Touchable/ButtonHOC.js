/* @flow */

import React from 'react';

type Props = {
  onTouchTap?: Function,
  onClick?: Function,
  payload?: any,
};

const ButtonHOC = (WrapedComponent: any) => {
  return class extends React.Component<Props> {
    props: Props
    onTouchTap = (event: any) => {
      if (this.props.onTouchTap) {
        this.props.onTouchTap(event, this.props.payload);
      }
    }

    onClick = (event: any) => {
      if (this.props.onClick) {
        this.props.onClick(event, this.props.payload);
      }
    }

    render() {
      const { payload, onTouchTap, ...props } = this.props;
      return (
        <WrapedComponent
          onTouchTap={this.onTouchTap}
          onClick={this.onClick}
          {...props}
        />
      );
    }
  };
};

export default ButtonHOC;
