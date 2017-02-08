/* @flow */

import React from 'react';
import { Link } from 'react-router';

import cls from './Header.scss';

class Header extends React.Component {
  render() {
    return (
      <div className={cls.header}>
        <Link to="/">
          <p className={cls.title} >Project name</p>
        </Link>
      </div>
    );
  }
}

export default Header;
