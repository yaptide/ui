/* @flow */

import React from 'react';
import WorkspaceLayout from 'pages/WorkspaceLayout';
import WorkspaceGeometryLayout from '../components/WorkspaceGeometryLayout';

class WorkspaceSettingsContainer extends React.Component {
  render() {
    return (
      <WorkspaceLayout
        activeWorkspaceTab="geometry"
      >
        <WorkspaceGeometryLayout />
      </WorkspaceLayout>
    );
  }
}

export default WorkspaceSettingsContainer;
