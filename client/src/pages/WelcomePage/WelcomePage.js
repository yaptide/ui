/* @flow */

import React from 'react';
import { LoginForm, RegisterForm } from 'routes/Auth';

import Style from 'styles';
import AppLayout from '../AppLayout';

type Props = {
  router: Object,
};

type State = {
  active: 'login' | 'register',
};

class WelcomePage extends React.Component {
  props: Props;
  state: State = {
    active: 'register',
  }

  showLoginForm = () => {
    this.setState({ active: 'login' });
  }

  showRegisterForm = () => {
    this.setState({ active: 'register' });
  }

  render() {
    const Form = mapStateToForm[this.state.active];
    const buttons = [
      { label: 'Sing In', handler: this.showLoginForm, isActive: this.state.active === 'login' },
      { label: 'Sing Up', handler: this.showRegisterForm, isActive: this.state.active === 'register' },
    ];

    return (
      <AppLayout
        buttons={buttons}
      >
        <div style={styles.container}>
          <p style={styles.description}>We will make Palantir great again!</p>
          <div style={styles.form}>
            <Form includeLinks={false} router={this.props.router} />
          </div>
        </div>
      </AppLayout>
    );
  }
}

const mapStateToForm = {
  register: RegisterForm,
  login: LoginForm,
};

const styles = {
  container: {
    ...Style.Flex.rootRow,
    ...Style.Flex.elementEqual,
    justifyContent: 'stretch',
    paddingTop: Style.Dimens.spacing.veryLarge,
    paddingLeft: Style.Dimens.spacing.veryLarge,
    paddingRight: Style.Dimens.spacing.veryLarge,
  },
  description: {
    flex: '1 0 0',
    overflow: 'hidden',
    fontSize: '30pt',
    paddingLeft: Style.Dimens.spacing.normal,
    paddingRight: Style.Dimens.spacing.normal,
  },
  form: {
    overflow: 'hidden',
    width: '300px',
    paddingLeft: Style.Dimens.spacing.normal,
    paddingRight: Style.Dimens.spacing.normal,
    ...Style.Flex.rootColumn,
  },
};

//      <Link to="/auth/login"><p>Login</p></Link>
//      <Link to="/auth/register"><p>Register</p></Link>
//      <Link to="/project/list"><p>ProjectsList</p></Link>
//      <Link to="/project/details"><p>ProjectDetails</p></Link>
export default WelcomePage;
