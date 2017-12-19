/* @flow */

import React from 'react';
import AppLayout from 'pages/AppLayout';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';

type Props = {
  children: React$Element<*>,
  classes: Object,
};

class AuthLayout extends React.Component<Props> {
  props: Props

  render() {
    const { children, classes } = this.props;
    return (
      <AppLayout classes={{ root: classes.layout }} >
        <div className={classes.formWrapper} >
          <Paper className={classes.block} elevation={4} >
            {children}
          </Paper>
        </div>
      </AppLayout>
    );
  }
}

const styles = (theme: Object) => ({
  formWrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  block: {
    width: '300px',
    padding: theme.spacing.unit * 3,
  },
  layout: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export default withStyles(styles)(AuthLayout);
