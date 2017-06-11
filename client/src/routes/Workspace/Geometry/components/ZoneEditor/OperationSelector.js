/* @flow */

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButtonMD from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Style from 'styles';
import { ButtonHOC } from 'components/Touchable';
import type { OperationType } from '../../../model';

const FlatButton = ButtonHOC(FlatButtonMD);

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

  onMenuItemSelected = (event: any, operation: OperationType) => {
    this.props.onOperationSelected(this.props.id, operation);
    this.handleRequestClose();
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
            <FlatButton style={styles.selector} payload="union" icon={Style.Icons.union} onTouchTap={this.onMenuItemSelected} />
            <FlatButton style={styles.selector} payload="intersect" icon={Style.Icons.intersect} onTouchTap={this.onMenuItemSelected} />
            <FlatButton style={styles.selector} payload="subtract" icon={Style.Icons.subtract} onTouchTap={this.onMenuItemSelected} />
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

