/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';

import { t } from 'i18n';

import { Form, FormInput } from 'components/Form';

import type { LoginData } from '../model';

type Props = {
  login: (LoginData) => void,
  //  requestErrors: Map<string, List<string>>,
  //  requestPending: bool,
}
type State = {
  username: string,
  password: string,
}

class LoginContainer extends React.Component {
  props: Props
  state: State = {
    username: '',
    password: '',
  }

  onChange = (value, type) => {
    this.setState({ [type]: value });
  }

  login = () => {
    this.props.login({
      username: this.state.username,
      password: this.state.password,
    });
  }

  render() {
    const links = [
      { text: t('auth.links.goRegister'), url: '/auth/register' },
    ];

    return (
      <Form
        submit={this.login}
        submitText={t('auth.form.loginBtn')}
        links={links}
      >
        <FormInput
          value={this.state.username}
          type="username"
          placeholder={t('auth.form.usernameLabel')}
          onChange={this.onChange}
        />
        <FormInput
          value={this.state.password}
          type="password"
          placeholder={t('auth.form.passwordLabel')}
          onChange={this.onChange}
          secureTextEntry
        />
      </Form>
    );
  }
}


const mapStateToProps = () => {
  return {
    requestErrors: List(),
    requestPending: false,
  };
};

const mapDispatchToProps = () => {
  return {
    login: (loginData: LoginData) => {
      console.log('login', loginData.username, loginData.password);
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginContainer);
