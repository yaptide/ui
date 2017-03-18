/* @flow */

import React from 'react';
import Style from 'styles';
import ZoneWorkspaceContainer from '../containers/ZoneWorkspaceContainer';

class WorkspaceGeometryLayout extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <div style={styles.visualisationContainer}>
          {/* TODO */}
        </div>
        <div style={styles.zoneForm}>
          <ZoneWorkspaceContainer />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.rootRow,
    ...Style.Flex.elementEqual,
    alignItems: 'stretch',
    margin: Style.Dimens.spacing.normal,
  },
  visualisationContainer: {
    ...Style.Flex.elementEqual,
    border: '2px solid',
  },
  zoneForm: {
    width: '500px',
    overflowY: 'scroll',
  },
};

export default WorkspaceGeometryLayout;
