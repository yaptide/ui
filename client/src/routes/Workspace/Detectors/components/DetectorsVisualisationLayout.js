

import React from 'react';
import { withStyles } from 'material-ui/styles';
import Visualisation, { processGeometry } from 'components/Visualisation';

type Props = {
  geometry: any,
  classes: Object,
}

class DetectorsVisualisationLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <Visualisation
        geometry={processGeometry(this.props.geometry)}
        classes={{ root: classes.root }}
      />
    );
  }
}

const styles = {
  root: {},
};

export default withStyles(styles)(DetectorsVisualisationLayout);
