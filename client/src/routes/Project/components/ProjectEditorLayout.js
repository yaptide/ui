/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import AppLayout from 'pages/AppLayout';

type Props = {
  children: React$Element<*>,
  classes: Object,
}

class ProjectEditorLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <AppLayout>
        <div className={classes.root} >
          <Paper className={classes.paper} elevation={4} >
            {this.props.children}
          </Paper>
        </div>
      </AppLayout>
    );
  }
}


const styles = () => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paper: {
    marginTop: 100,
    width: 700,
  },
});

export default withStyles(styles)(ProjectEditorLayout);
