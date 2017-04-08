/* @flow */

import React from 'react';
import { Header } from 'components/Header';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
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
      <MuiThemeProvider muiTheme={getMuiTheme(Style.Theme)} >
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
    minHeight: '300px',
    minWidth: '800px',
    background: Style.Theme.palette.canvasColor,
  },
};

export default AppLayout;
