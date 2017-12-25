/* @flow */

import React from 'react';
import { CircularProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
import AppLayout from 'pages/AppLayout';

type Props = {
  classes: Object,
}

class LoadingCircle extends React.Component<Props> {
  props: Props;

  render() {
    const classes = this.props.classes;
    return (
      <AppLayout classes={{ root: classes.layout }} >
        <div className={classes.root}>
          <CircularProgress size={70} />
        </div>
      </AppLayout>
    );
  }
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'row',
    flex: '1 0 0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layout: {
    display: 'flex',
    flexDirection: 'column',
  },
};

export default withStyles(styles)(LoadingCircle);
