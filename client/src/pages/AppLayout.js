/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Style from 'styles';
import { actionType } from 'routes/Auth/reducer';
import cls from '../styles/core.scss'; // eslint-disable-line no-unused-vars

type Props = {
  children?: any,
  isLoggedIn: bool,
  logout: Function,
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

const mapStateToProps = (state) => {
  return {
    isLoggedIn: !!state.auth.get('token'),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch({ type: actionType.LOGOUT }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppLayout);
