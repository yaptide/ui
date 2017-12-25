/* flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';

type Props = {
  children: React.Element<*>,
  classes: Object,
}

class MaterialItemLayout extends React.Component {
  props: Props

  render() {
    const classes = this.props.classes;

    return (
      <Paper className={classes.root} >
        {this.props.children}
      </Paper>
    );
  }
}

const styles = {
  root: {},
};

export default withStyles(styles)(MaterialItemLayout);
