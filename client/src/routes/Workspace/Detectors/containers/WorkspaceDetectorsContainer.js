/* @flow */

import React from 'react';
import WorkspaceLayout from 'pages/WorkspaceLayout';

class WorkspaceDetectorsContainer extends React.Component<{}> {
  render() {
    return (
      <WorkspaceLayout
        isWorkspaceLoading
        activeWorkspaceTab="detectors"
      />
    );
  }
}

export default WorkspaceDetectorsContainer;
