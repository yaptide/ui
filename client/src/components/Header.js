/* @flow */

import React from 'react';
import cls from './Header.scss';

class Header extends React.Component {
  render() {
    return (
      <div className={cls.header}>
        <p className={cls.title} >Project name</p>
      </div>
    );
  }
}

export default Header;
