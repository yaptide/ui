/* @flow */

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Style from 'styles';
import type { OperationType } from '../../../model';

type Props = {
  id: number,
  onOperationSelected: (type: number, value: OperationType) => void,
  operation: string,
  style?: Object,
};

class OperationSelector extends React.Component {
  props: Props;
  state: {
    open: bool,
      anchorEl?: any,
  } = {
    open: false,
  }

  onMenuItemSelected = (event: any) => {
    this.props.onOperationSelected(this.props.id, event.target.value);
  }

  handleTouchTap = (event: any) => {
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };


  render() {
    return (
      <div style={this.props.style}>
        <RaisedButton
          onTouchTap={this.handleTouchTap}
          icon={Style.Icons[this.props.operation]}
          style={styles.selector}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <div style={Style.Flex.rootColumn}>
            <FlatButton style={styles.selector} key={1} value="union" icon={Style.Icons.union} onTouchTap={this.onMenuItemSelected} />
            <FlatButton style={styles.selector} key={2} value="intersect" icon={Style.Icons.intersect} />
            <FlatButton style={styles.selector} key={3} value="subtract" icon={Style.Icons.subtract} />
          </div>
        </Popover>
      </div>
    );
  }
}

const styles = {
  selector: {
    width: '50px',
    minWidth: '50px',
  },
};

export default OperationSelector;

