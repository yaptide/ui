/* @flow */

import React from 'react';
import WorkspaceLayout from 'pages/WorkspaceLayout';

class WorkspaceBeamContainer extends React.Component<{}> {
  render() {
    return (
      <WorkspaceLayout
        isWorkspaceLoading
        activeWorkspaceTab="beam"
      />
    );
  }
}

export default WorkspaceBeamContainer;
