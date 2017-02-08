/* @flow */

import React from 'react';
import { Link } from 'react-router';

import AppLayout from '../AppLayout';

class WelcomePage extends React.Component {
  render() {
    return (
      <AppLayout>
        <Link to="/auth/login"><p>Login</p></Link>
        <Link to="/auth/register"><p>Register</p></Link>
        <Link to="/project/list"><p>ProjectsList</p></Link>
        <Link to="/project/details"><p>ProjectDetails</p></Link>
      </AppLayout>
    );
  }
}

export default WelcomePage;
