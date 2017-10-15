/* @flow */

import React from 'react';
import WorkspaceLayout from 'pages/WorkspaceLayout';
import WorkspaceDetectorsLayout from '../components/WorkspaceDetectorsLayout';

type Props = {
  classes?: Object,
};

type State = {
  shouldShowVisualisation: bool,
  visualisedDetectors: {[string]: bool},
}

class WorkspaceDetectorsContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    shouldShowVisualisation: true,
    visualisedDetectors: {},
  }

  updateVisualisationStatus = (detectorId: string, setVisible: bool) => {
    this.setState({
      visualisedDetectors: {
        ...this.state.visualisedDetectors,
        [String(detectorId)]: setVisible,
      },
    });
  }

  showVisualisation = (setVisible: bool) => {
    this.setState({ shouldShowVisualisation: setVisible });
  }

  render() {
    return (
      <WorkspaceLayout
        activeWorkspaceTab="detectors"
      >
        <WorkspaceDetectorsLayout
          shouldShowVisualisation={this.state.shouldShowVisualisation}
          visualisedDetectors={this.state.visualisedDetectors}
          updateVisualisationStatus={this.updateVisualisationStatus}
          showVisualisation={this.showVisualisation}
          classes={this.props.classes}
        />
      </WorkspaceLayout>
    );
  }
}

export default WorkspaceDetectorsContainer;
