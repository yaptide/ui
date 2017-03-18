/* @flow */

import React from 'react';
import Style from 'styles';
import ZoneItemContainer from '../containers/ZoneItemContainer';

class ZoneWorkspaceLayout extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <ZoneItemContainer zoneId="abc" />
      </div>
    );
  }
}

const styles = {
  container: {
    marginTop: `-${Style.Dimens.spacing.normal}`,
    padding: Style.Dimens.spacing.normal,
  },
};

export default ZoneWorkspaceLayout;
