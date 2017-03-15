/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';

import { t } from 'i18n';

import { Form, FormInput } from 'components/Form';

import type { LoginData } from '../model';

type Props = {
  router: {
    push: (string) => void,
  },
  includeLinks?: bool,
  login: (LoginData) => void,
  //  requestErrors: Map<string, List<string>>,
  //  requestPending: bool,
}
type State = {
  username: string,
  password: string,
}

class LoginContainer extends React.Component {
  static defaultProps = { includeLinks: true }
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
    this.props.router.push('project/list');
  }

  render() {
    const links = this.props.includeLinks ? [
      { text: t('auth.links.goRegister'), url: '/auth/register' },
    ] : undefined;

    return (
      <Form
        submit={this.login}
        submitText={t('auth.form.loginBtn')}
        links={links}
      >
        <FormInput
          value={this.state.username}
          type="username"
          floatingLabelText={t('auth.form.usernameLabel')}
          onChange={this.onChange}
        />
        <FormInput
          value={this.state.password}
          type="password"
          floatingLabelText={t('auth.form.passwordLabel')}
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
