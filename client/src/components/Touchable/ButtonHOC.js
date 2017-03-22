/* @flow */

import React from 'react';

const ButtonHOC = (WrapedComponent: any) => {
  return class extends React.Component {
    props: {
      onTouchTap?: Function,
      payload?: any,
    }
    onTouchTap = (event: any) => {
      if (this.props.onTouchTap) {
        this.props.onTouchTap(event, this.props.payload);
      }
    }

    render() {
      const { payload, onTouchTap, ...props } = this.props;
      return (
        <WrapedComponent
          onTouchTap={this.onTouchTap}
          {...props}
        />
      );
    }
  };
};

export default ButtonHOC;
