/* @flow */

import React from 'react';

import DownArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import UpArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import IconButton from 'material-ui/IconButton';

class ZoneName extends React.Component {
  props: {
    name?: string,
    isOpen: bool,
    toggleOpen: () => void,
  }

  render() {
    return (
      <div>
        <div>{this.props.name}</div>
        <IconButton onTouchTap={this.props.toggleOpen} style={{ position: 'absolute', right: '30px', top: '0px' }} >
          { this.props.isOpen ? <UpArrowIcon /> : <DownArrowIcon /> }
        </IconButton>
      </div>
    );
  }
}

export default ZoneName;
