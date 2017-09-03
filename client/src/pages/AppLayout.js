/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { MuiThemeProvider, createMuiTheme, withStyles } from 'material-ui/styles';
import grey from 'material-ui/colors/grey';
import Style from 'styles';
import { actionType } from 'routes/Auth/reducer';
import cls from '../styles/core.scss'; // eslint-disable-line no-unused-vars

const appPalette = {
  type: 'dark',
};

const appTheme = createMuiTheme({
  overrides: {
    MuiButton: {
      raisedContrast: {
        background: grey[800],
        '&:hover': {
          background: grey[700],
        },
      },
    },
  },
  palette: appPalette,
});
console.log(appTheme);

type Props = {
  children?: any,
  isLoggedIn: bool,
  logout: Function,
  classes: Object,
};

class AppLayout extends React.Component<Props> {
  props: Props;

  render() {
    const { children, classes, ...props } = this.props;
    return (
      <MuiThemeProvider theme={appTheme}>
        <div className={classes.layout}>
          <Header {...props} />
          {children}
        </div>
      </MuiThemeProvider>
    );
  }
}

const styles = (theme: Object) => ({
  layout: {
    ...Style.Flex.rootColumn,
    ...Style.Flex.elementEqual,
    overflow: 'auto',
    minHeight: theme.breakpoints.values[1],
    minWidth: theme.breakpoints.values[1],
    background: '#2B2B2B',
  },
});

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
)(withStyles(styles)(AppLayout));
