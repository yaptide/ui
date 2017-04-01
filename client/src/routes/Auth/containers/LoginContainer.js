/* @flow */

import React from 'react';
import { connect } from 'react-redux';

import { t } from 'i18n';

import { Form, FormInput } from 'components/Form';

import type { LoginData } from '../model';
import selector from '../selector';
import { actionCreator } from '../reducer';

type Props = {
  includeLinks?: bool,
  login: (LoginData) => void,
  loginError: { username?: string, password?: string, all?: string },
  // isLoginPending: bool,
  clearError: (field: string) => void,
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
    this.props.clearError(type);
    if (type === 'password') {
      this.props.clearError('all');
    }
  }

  login = () => {
    this.props.login({
      username: this.state.username,
      password: this.state.password,
    });
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
          errorText={this.props.loginError.username}
        />
        <FormInput
          value={this.state.password}
          type="password"
          floatingLabelText={t('auth.form.passwordLabel')}
          onChange={this.onChange}
          errorText={this.props.loginError.all || this.props.loginError.password}
          secureTextEntry
        />
      </Form>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    ...selector.loginSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (loginData: LoginData) => {
      return dispatch(actionCreator.login(loginData));
    },
    clearError: (field: string) => {
      return dispatch(actionCreator.clearLoginError(field));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginContainer);
