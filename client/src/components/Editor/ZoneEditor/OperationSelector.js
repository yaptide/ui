/* @flow */

import React from 'react';
import Button from 'material-ui/Button';
import Menu, { MenuItem as MenuItemMD } from 'material-ui/Menu';
import { withStyles } from 'material-ui/styles';
import Style from 'styles';
import { ButtonHOC } from 'components/Touchable';
import type { OperationType, ConstructionPath } from 'model/simulation/zone';
import cn from 'classnames';

const MenuItem = ButtonHOC(MenuItemMD);

type Props = {
  constructionPath: ConstructionPath,
  onOperationSelected: (type: ConstructionPath, value: OperationType) => void,
  operation: string,
  style?: Object,
  classes: Object,
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
    this.props.onOperationSelected(this.props.constructionPath, operation);
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
    const { classes } = this.props;
    return (
      <div className={classes.root} >
        <Button
          onTouchTap={this.handleTouchTap}
          className={cn(classes.iconBtn)}
          raised
          dense
        >
          {Style.Icons[this.props.operation]}
        </Button>
        <Menu
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handleRequestClose}
          className={classes.menuContent}
        >
          <MenuItem
            className={classes.selector}
            payload="union"
            selected={this.props.operation === 'union'}
            onTouchTap={this.onMenuItemSelected}
          >
            {Style.Icons.union}
          </MenuItem>
          <MenuItem
            className={classes.selector}
            payload="intersect"
            selected={this.props.operation === 'intersect'}
            onTouchTap={this.onMenuItemSelected}
          >
            {Style.Icons.intersect}
          </MenuItem>
          <MenuItem
            className={classes.selector}
            payload="subtract"
            selected={this.props.operation === 'subtract'}
            onTouchTap={this.onMenuItemSelected}
          >
            {Style.Icons.subtract}
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {},
  selector: {
    overflow: 'hidden',
    '&:hover': {
      background: theme.palette.grey.A200,
    },
    '&:active': {
      background: theme.palette.grey.A300,
    },
    color: theme.palette.common.darkBlack,
  },
  iconBtn: {
    paddingTop: '9px',
    paddingBottom: '9px',
  },
  menuContent: {
    background: theme.palette.grey[300],
  },
});

export default withStyles(styles)(OperationSelector);

