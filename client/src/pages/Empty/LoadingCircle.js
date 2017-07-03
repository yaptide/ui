/* @flow */

import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import Style from 'styles';

class LoadingCircle extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <CircularProgress size={70} thickness={6} />
      </div>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.elementEqual,
    ...Style.Flex.rootColumn,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default LoadingCircle;
