/* @flow */

import React from 'react';

type Props = {
  type?: string,
  title: string,
  style?: {[string]: string},
  onClick: (type?: string) => void,
}

class Touchable extends React.Component {
  props: Props;

  onClick = () => {
    this.props.onClick(this.props.type);
  }

  render() {
    const { onClick, title, ...props } = this.props;
    return (
      <button
        style={this.props.style}
        onClick={this.onClick}
        {...props}
      >
        {title}
      </button>
    );
  }
}

export default Touchable;
