import React from 'react';
import cls from './Header.scss';

const Header = React.createClass({
  render() {
    return (
      <div className={cls.header}>
        <p className={cls.title} >Project name</p>
      </div>
    );
  },
});

export default Header;
