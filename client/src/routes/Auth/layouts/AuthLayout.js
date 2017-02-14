/* @flow */

import React, { Element } from 'react';
import Header from 'components/Header';

type Props = {
  children?: Element<*>,
};

class AuthLayout extends React.Component {
  props: Props

  render() {
    return (
      <div style={styles.container} >
        <Header />
        <div style={styles.formWrapper} >
          {this.props.children}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  formWrapper: {
    flex: '1 0 auto',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
};

export default AuthLayout;
