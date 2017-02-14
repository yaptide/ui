/* @flow */

import React from 'react';
import { connect } from 'react-redux';

import { List } from 'immutable';
import { t } from 'i18n';
import { Form, FormInput } from 'components/Form';

import type { RegisterData } from '../model';

type Props = {
  register: RegisterData => void,
  //  requestErrors: Map<string, List<string>>,
  //  requestPending: bool,
};
type State = {
  email: string,
  username: string,
  password: string,
  repeatPassword: string,
};

class RegisterContainer extends React.Component {
  props: Props
  state: State = {
    email: '',
    username: '',
    password: '',
    repeatPassword: '',
  }

  onChange = (value, type) => {
    this.setState({ [type]: value });
  }

  register = () => {
    this.props.register({
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
    });
  }

  render() {
    const links = [
      { text: t('auth.links.goLogin'), url: '/auth/login' },
    ];
    return (
      <Form
        submit={this.register}
        submitText={t('auth.form.registerBtn')}
        links={links}
      >
        <FormInput
          value={this.state.email}
          type="email"
          placeholder={t('auth.form.emailLabel')}
          onChange={this.onChange}
        />
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
        <FormInput
          value={this.state.repeatPassword}
          type="repeatPassword"
          placeholder={t('auth.form.repeatPasswordLabel')}
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
    register: (registerData: RegisterData) => {
      console.log('register',
        registerData.email,
        registerData.username,
        registerData.password,
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegisterContainer);
