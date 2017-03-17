/* @flow */

import React from 'react';
import WorkspaceLayout from 'pages/WorkspaceLayout';

class WorkspaceSettingsContainer extends React.Component {
  render() {
    return (
      <WorkspaceLayout
        activeWorkspaceTab="geometry"
      />
    );
  }
}

export default WorkspaceSettingsContainer;
