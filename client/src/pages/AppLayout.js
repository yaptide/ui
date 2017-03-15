/* @flow */

import React from 'react';
import { Header } from 'components/Header';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Style from 'styles';
import cls from '../styles/core.scss'; // eslint-disable-line no-unused-vars

type Props = {
  children?: any,
};

class AppLayout extends React.Component {
  props: Props;

  render() {
    const { children, ...props } = this.props;
    return (
      <MuiThemeProvider>
        <div style={styles.layout}>
          <Header {...props} />
          {children}
        </div>
      </MuiThemeProvider>
    );
  }
}

const styles = {
  layout: {
    ...Style.Flex.rootColumn,
    ...Style.Flex.elementEqual,
    overflow: 'auto',
    minHeight: '350px',
    minWidth: '800px',
  },
};

export default AppLayout;
