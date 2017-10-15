/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import PlusIcon from 'material-ui-icons/Add';
import cn from 'classnames';
import DetectorItemContainer from '../containers/DetectorItemContainer';

type Props = {
  detectors: Array<number>,
  addDetector: () => void,
  classes: Object,
};

class DetectorsListLayout extends React.Component<Props> {
  props: Props
  render() {
    const classes = this.props.classes;
    const detectors = this.props.detectors.map((id) => {
      return (
        <DetectorItemContainer
          key={id}
          detectorId={id}
          classes={{ root: classes.item }}
        />
      );
    });

    const addDetectorBtn = (
      <Button
        onClick={this.props.addDetector}
        className={cn(classes.item, classes.btn)}
        raised
        color="contrast"
        dense
      >
        <PlusIcon />
      </Button>
    );
    return (
      <div className={classes.root} >
        {detectors}
        {addDetectorBtn}
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    marginBottom: theme.spacing.unit * 2,
    flex: '0 0 auto',
  },
  btn: {
    alignItems: 'stretch',
  },
});

export default withStyles(styles)(DetectorsListLayout);
