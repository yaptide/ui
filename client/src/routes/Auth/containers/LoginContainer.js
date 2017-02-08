/* flow */

import React from 'react';
import { Link } from 'react-router';

class LoginContainer extends React.Component {
  render() {
    return (
      <div>
        LoginContainer
        <Link to="/auth/register">go to RegisterContainer</Link>
      </div>
    );
  }
}

export default LoginContainer;
