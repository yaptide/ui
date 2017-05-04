/* @flow */

import React from 'react';
import router from 'utils/router';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import ExitIcon from 'material-ui/svg-icons/action/exit-to-app';
import Drawer from 'material-ui/Drawer';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { t } from 'i18n';

const links = {
  login: () => router.push('/auth/login'),
  register: () => router.push('/auth/register'),
  project: () => router.push('/project/list'),
  workspace: () => router.push('/workspace'),
  account: () => router.push('/account'),
  about: () => router.push('/about'),
  help: () => router.push('/help'),
};

const NotLoggedIn = ({ ...props }) => (
  <div>
    <FlatButton {...props} onTouchTap={links.login} label={t('auth.form.loginBtn')} />
    <FlatButton {...props} onTouchTap={links.register} label={t('auth.form.registerBtn')} />
  </div>
);
NotLoggedIn.muiName = 'FlatButton';

const LoggedIn = ({ ...buttonProps }) => {
  const { logout, ...props } = buttonProps;
  return (
    <FlatButton
      {...props}
      label={t('auth.form.logoutBtn')}
      onTouchTap={logout}
      icon={<ExitIcon />}
    />
  );
};
LoggedIn.muiName = 'FlatButton';

const LoggedInMenuItems = [
  <MenuItem key="project" onTouchTap={links.project}>{t('pageProjects')}</MenuItem>,
  <MenuItem key="account" onTouchTap={links.account}>{t('pageAccount')}</MenuItem>,
];

type Props = {
  isLoggedIn: bool,
  logout: Function,
};

class Header extends React.Component {
  props: Props;
  state: {
    drawer: bool,
  } = {
    drawer: false,
  }

  goToMain = () => {
    // if not logged
    router.push('/');
  }

  showDrawer = () => {
    this.setState({ drawer: true });
  }

  hideDrawer = () => {
    this.setState({ drawer: false });
  }

  render() {
    return (
      <AppBar
        title={t('appName')}
        iconElementRight={
          this.props.isLoggedIn ? <LoggedIn logout={this.props.logout} /> : <NotLoggedIn />
        }
        onLeftIconButtonTouchTap={this.showDrawer}
        onTitleTouchTap={this.goToMain}
        style={styles.container}
        titleStyle={{ cursor: 'pointer', flex: '0 1 auto' }}
      >
        <Drawer
          open={this.state.drawer}
          docked={false}
          onRequestChange={this.hideDrawer}
        >
          <Menu>
            <MenuItem onTouchTap={links.workspace}>{t('pageWorkspace')}</MenuItem>
            {this.props.isLoggedIn ? LoggedInMenuItems : null}
            <MenuItem onTouchTap={links.about}>{t('pageAbout')}</MenuItem>
            <MenuItem onTouchTap={links.help}>{t('pageHelp')}</MenuItem>
          </Menu>
        </Drawer>
      </AppBar>
    );
  }
}

const styles = {
  container: {
    flexShrink: '0',
  },
};

export default Header;
