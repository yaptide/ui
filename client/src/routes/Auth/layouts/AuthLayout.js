/* @flow */

import React, { Element } from 'react';
import AppLayout from 'pages/AppLayout';
import Style from 'styles';
import Paper from 'material-ui/Paper';

type Props = {
  children?: Element<*>,
};

class AuthLayout extends React.Component {
  props: Props

  render() {
    const { children } = this.props;
    return (
      <AppLayout>
        <div style={styles.formWrapper} >
          <Paper style={{ padding: '20px' }} zDepth={3} >
            {children}
          </Paper>
        </div>
      </AppLayout>
    );
  }
}

const styles = {
  formWrapper: {
    ...Style.Flex.elementEqual,
    ...Style.Flex.rootColumn,
    ...Style.Flex.center,
  },
};

export default AuthLayout;
