/* @flow */

import React from 'react';
import Menu, { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';

type Props = {
  type?: any,
  value: any,
  label: string,
  onChange: (value: any, type: any) => void,
  options: Array<{ field: string, label: string }>,
  classes: Object,
}

class FormSelect extends React.Component {
  props: Props
  state: {
    open: bool,
    anchorEl: any,
  } = {
    open: false,
    anchorEl: undefined,
  }

  onChange = (event: any) => {
    this.props.onChange(event.target.getAttribute('value'), this.props.type);
    this.handleClose();
  }

  handleOpen = (event: Object) => {
    this.setState({ open: true, anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  render() {
    const { value, options, label } = this.props;
    return (
      <div>
        <Button
          onTouchTap={this.handleOpen}
        >
          {value || `select ${label}`}
        </Button>
        <Menu
          id="inputSelect"
          value={value}
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          {
            options.map((item, index) => (
              <MenuItem
                key={index}
                value={item.field}
                onClick={this.onChange}
              >
                {item.label}
              </MenuItem>
            ))
          }
        </Menu>
      </div>
    );
  }
}

const styles = {
};

export default withStyles(styles)(FormSelect);
