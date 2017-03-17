/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import router from 'utils/router';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import { t } from 'i18n';

const links = {
  login: () => router.push('/auth/login'),
  register: () => router.push('/auth/register'),
};

const NotLoggedIn = ({ ...props }) => (
  <div>
    <FlatButton {...props} onTouchTap={links.login} label={t('auth.form.loginBtn')} />
    <FlatButton {...props} onTouchTap={links.register} label={t('auth.form.registerBtn')} />
  </div>
);

NotLoggedIn.muiName = 'FlatButton';

type Props = {
};

class Header extends React.Component {
  props: Props;

  goToMain = () => {
    // if not logged
    router.push('/');
  }

  render() {
    return (
      <AppBar
        title={t('appName')}
        iconElementRight={
          <NotLoggedIn />
        }
        onTitleTouchTap={this.goToMain}
        style={styles.container}
        titleStyle={{ cursor: 'pointer', flex: '0 1 auto' }}
      />
    );
  }
}

const styles = {
  container: {
    flexShrink: '0',
  },
};

const mapStateToProps = () => {
  return {
    isLoggedIn: true,
  };
};


export default connect(
  mapStateToProps,
)(Header);
