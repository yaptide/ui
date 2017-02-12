/* @flow */

import React from 'react';
import { Link } from 'react-router';

import { t } from '../i18n';

import cls from './Header.scss';

class Header extends React.Component {
  render() {
    return (
      <div className={cls.header}>
        <Link to="/">
          <p className={cls.title} >{t('appName')}</p>
        </Link>
      </div>
    );
  }
}

export default Header;
