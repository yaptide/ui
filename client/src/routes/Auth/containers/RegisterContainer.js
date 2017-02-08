/* flow */

import React from 'react';
import { Link } from 'react-router';

class RegisterContainer extends React.Component {
  render() {
    return (
      <div>
        RegisterContainer
        <Link to="/auth/login" >go to LoginContainer</Link>
      </div>
    );
  }
}

export default RegisterContainer;
