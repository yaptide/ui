/* @flow */

import React from 'react';
import AppLayout from 'pages/AppLayout';
import Style from 'styles';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';

type Props = {
  children: React$Element<*>,
  classes: Object,
};

class AuthLayout extends React.Component<Props> {
  props: Props

  render() {
    const { children } = this.props;
    return (
      <AppLayout>
        <div className={this.props.classes.formWrapper} >
          <Paper className={this.props.classes.block} elevation={4} >
            {children}
          </Paper>
        </div>
      </AppLayout>
    );
  }
}

const styles = (theme: Object) => ({
  formWrapper: {
    ...Style.Flex.elementEqual,
    ...Style.Flex.rootColumn,
    ...Style.Flex.center,
  },
  block: {
    width: '270px',
    padding: theme.spacing.unit * 3,
  },
});

export default withStyles(styles)(AuthLayout);
