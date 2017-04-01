/* @flow */

import React from 'react';
import { connect } from 'react-redux';

import { t } from 'i18n';
import { Form, FormInput } from 'components/Form';

import { actionCreator } from '../reducer';
import selector from '../selector';
import type { RegisterData } from '../model';

type Props = {
  includeLinks?: bool,
  register: RegisterData => void,
  registerError: { username?: string, email?: string, password?: string },
  // isRegisterPending: bool,
  clearError: (field: string) => void,
};
type State = {
  email: string,
  username: string,
  password: string,
  repeatPassword: string,
};

class RegisterContainer extends React.Component {
  static defaultProps = { includeLinks: true }
  props: Props
  state: State = {
    email: '',
    username: '',
    password: '',
    repeatPassword: '',
  }

  onChange = (value, type) => {
    this.setState({ [type]: value });
    this.props.clearError(type);
  }

  register = () => {
    this.props.register({
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
    });
  }

  render() {
    const links = this.props.includeLinks ? [
      { text: t('auth.links.goLogin'), url: '/auth/login' },
    ] : undefined;

    return (
      <Form
        submit={this.register}
        submitText={t('auth.form.registerBtn')}
        links={links}
      >
        <FormInput
          value={this.state.email}
          type="email"
          floatingLabelText={t('auth.form.emailLabel')}
          onChange={this.onChange}
          errorText={this.props.registerError.email}
        />
        <FormInput
          value={this.state.username}
          type="username"
          floatingLabelText={t('auth.form.usernameLabel')}
          onChange={this.onChange}
          errorText={this.props.registerError.username}
        />
        <FormInput
          value={this.state.password}
          type="password"
          floatingLabelText={t('auth.form.passwordLabel')}
          onChange={this.onChange}
          secureTextEntry
          errorText={this.props.registerError.password}
        />
        <FormInput
          value={this.state.repeatPassword}
          type="repeatPassword"
          floatingLabelText={t('auth.form.repeatPasswordLabel')}
          onChange={this.onChange}
          secureTextEntry
        />
      </Form>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ...selector.registerSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    register: (registerData: RegisterData) => {
      return dispatch(actionCreator.register(registerData));
    },
    clearError: (field: string) => {
      return dispatch(actionCreator.clearRegisterError(field));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegisterContainer);
