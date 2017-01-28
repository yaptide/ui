import React from 'react';
import Header from 'components/Header';
import globalStyles from '../styles/core.scss'; //eslint-disable-line

const AppLayout = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
  },
  render() {
    return (
      <div style={{ height: '100%' }}>
        <Header />
        {this.props.children}
      </div>
    );
  },
});

export default AppLayout;
