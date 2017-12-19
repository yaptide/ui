/* @flow */

import React from 'react';
import router from 'utils/router';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Drawer from 'material-ui/Drawer';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import ExitIcon from 'material-ui-icons/ExitToApp';
import MenuIcon from 'material-ui-icons/Menu';
import List, { ListItem, ListItemText } from 'material-ui/List';
import { withStyles } from 'material-ui/styles';
import { t } from 'i18n';


const handleHref = (func: () => void) => {
  return (e: any) => {
    e.preventDefault();
    if (e.nativeEvent.button !== 0) return;
    func();
  };
};

const links = {
  login: handleHref(() => router.push('/auth/login')),
  register: handleHref(() => router.push('/auth/register')),
  project: handleHref(() => router.push('/project/list')),
  workspace: handleHref(() => router.push('/workspace')),
  account: handleHref(() => router.push('/account')),
  about: handleHref(() => router.push('/about')),
  help: handleHref(() => router.push('/help')),
};

const NotLoggedIn = ({ ...props }) => (
  <div>
    <Button
      {...props}
      color="contrast"
      onTouchTap={links.login}
      href="#/auth/login"
    >
      {t('auth.form.loginBtn')}
    </Button>
    <Button
      {...props}
      color="contrast"
      onTouchTap={links.register}
      href="#/auth/register"
    >
      {t('auth.form.registerBtn')}
    </Button>
  </div>
);

const LoggedIn = ({ ...buttonProps }) => {
  const { logout, ...props } = buttonProps;
  return (
    <Button
      {...props}
      color="contrast"
      onTouchTap={logout}
      href="#/logout"
    >
      {t('auth.form.logoutBtn')}
      <ExitIcon />
    </Button>
  );
};

const LoggedInListItems = () => [
  <ListItem
    key="project"
    onTouchTap={links.project}
    component="a"
    button
    href="#/project/list"
  >
    <ListItemText primary={t('pageProjects')} />
  </ListItem>,
  <ListItem
    key="account"
    onTouchTap={links.account}
    component="a"
    button
    href="#/account"
  >
    <ListItemText primary={t('pageAccount')} />
  </ListItem>,
];

type Props = {
  isLoggedIn: bool,
  logout: Function,
  classes: Object,
};

type State = {
  drawer: bool,
};

class Header extends React.Component<Props, State> {
  props: Props;
  state: State = {
    drawer: false,
  }

  goToMain = () => {
    // if not logged
    router.push('/');
  }

  showDrawer = handleHref(() => { this.setState({ drawer: true }); })
  hideDrawer = () => { this.setState({ drawer: false }); }

  render() {
    const classes = this.props.classes;
    return (
      <AppBar
        position="static"
        className={classes.appbar}
      >
        <Toolbar>
          <IconButton
            color="contrast"
            aria-label="Menu"
            onTouchTap={this.showDrawer}
            href={window.location.hash}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            type="title"
            color="inherit"
            component="a"
            href="#"
          >
            {t('appName')}
          </Typography>
          <div className={classes.flex} />
          {
            this.props.isLoggedIn
              ? <LoggedIn logout={this.props.logout} />
              : <NotLoggedIn />
          }
          <Drawer
            open={this.state.drawer}
            onEscapeKeyUp={this.hideDrawer}
            onBackdropClick={this.hideDrawer}
            classes={{ paper: classes.drawer }}
          >
            <List>
              <ListItem
                onTouchTap={links.workspace}
                component="a"
                button
                href="#/workspace"
              >
                <ListItemText primary={t('pageWorkspace')} />
              </ListItem>
              {this.props.isLoggedIn ? LoggedInListItems() : null}
              <ListItem
                onTouchTap={links.about}
                component="a"
                button
                href="#/about"
              >
                <ListItemText primary={t('pageAbout')} />
              </ListItem>
              <ListItem
                onTouchTap={links.help}
                component="a"
                button
                href="#/help"
              >
                <ListItemText primary={t('pageHelp')} />
              </ListItem>
            </List>
          </Drawer>
        </Toolbar>
      </AppBar>
    );
  }
}

const styles = {
  appbar: {
  },
  flex: {
    flex: '1',
  },
  drawer: {
    width: 220,
  },
};

export default withStyles(styles)(Header);
