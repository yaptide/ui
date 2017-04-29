/* @flow */

import React from 'react';
import Style from 'styles';
import VisualisationContainer from '../containers/VisualisationContainer';
import ZoneWorkspaceContainer from '../containers/ZoneWorkspaceContainer';

class WorkspaceGeometryLayout extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <VisualisationContainer style={styles.visualisationContainer} />
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
    borderRadius: '4px',
    borderColor: Style.Colors.gray,
  },
  zoneForm: {
    width: '500px',
    position: 'relative',
  },
};

export default WorkspaceGeometryLayout;
