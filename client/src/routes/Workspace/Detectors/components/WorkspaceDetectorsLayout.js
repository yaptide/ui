/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import DetectorsVisualisationContainer from '../containers/DetectorsVisualisationContainer';
import DetectorsListContainer from '../containers/DetectorsListContainer';

type Props = {
  shouldShowVisualisation: bool,
  visualisedDetectors: {[string]: bool},
  updateVisualisationStatus: (detectorId: string, setVisible: bool) => void,
  showVisualisation: (setVisible: bool) => void,

  classes: Object,
};

class WorkspaceDetectorsLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
        <DetectorsVisualisationContainer
          classes={{ root: classes.visualisation }}
        />
        <DetectorsListContainer
          classes={{ root: classes.list }}
        />
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
  },
  visualisation: {
    flex: '1 0 0',
    margin: theme.spacing.unit * 2,
    border: '2px solid',
    borderRadius: '4px',
    borderColor: theme.palette.grey[100],
  },
  list: {
    width: 500,
    margin: theme.spacing.unit * 2,
    overflow: 'auto',
  },
});

export default withStyles(styles)(WorkspaceDetectorsLayout);
