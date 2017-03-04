/* @flow */

import React, { Element } from 'react';
import { Header } from 'components/Header';
import Style from 'styles';

type Props = {
  children?: Element<*>,
};

class AuthLayout extends React.Component {
  props: Props

  render() {
    const { children } = this.props;
    return (
      <div style={styles.container} >
        <Header />
        <div style={styles.formWrapper} >
          {children}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.rootColumn,
    ...Style.Flex.elementEqual,
  },
  formWrapper: {
    ...Style.Flex.elementEqual,
    ...Style.Flex.rootColumn,
    ...Style.Flex.center,
  },
};

export default AuthLayout;
