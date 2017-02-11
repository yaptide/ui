/* @flow */

import React from 'react';
import Header from 'components/Header';
import cls from '../styles/core.scss'; // eslint-disable-line no-unused-vars

type Props = {
  children?: any,
};

class AppLayout extends React.Component {
  props: Props;

  render() {
    return (
      <div style={{ height: '100%' }}>
        <Header />
        {this.props.children}
      </div>
    );
  }
}

export default AppLayout;
