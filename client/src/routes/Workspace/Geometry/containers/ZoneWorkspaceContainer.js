/* @flow */

import React from 'react';
import ZoneWorkspaceLayout from '../components/ZoneWorkspaceLayout';

class ZoneWorkspaceContainer extends React.Component {
  render() {
    const zoneIds = [1, 10, 21, 12, 43, 91, 121];
    return (
      <ZoneWorkspaceLayout zoneIds={zoneIds} />
    );
  }
}

export default ZoneWorkspaceContainer;
