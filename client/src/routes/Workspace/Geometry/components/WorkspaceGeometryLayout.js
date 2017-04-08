/* @flow */

import React from 'react';
import Style from 'styles';
import Visualisation from 'components/Visualisation/Visualisation';
import ZoneWorkspaceContainer from '../containers/ZoneWorkspaceContainer';

class WorkspaceGeometryLayout extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <Visualisation style={styles.visualisationContainer} />
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
