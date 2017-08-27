/* @flow */

import React from 'react';
import { CircularProgress } from 'material-ui/Progress';
import Style from 'styles';

class LoadingCircle extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <CircularProgress size={70} />
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
