/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import type { DetectorResultId } from 'model/result';
import ResultItemContainer from '../containers/ResultItemContainer';

type Props = {
  detectorIds: Array<DetectorResultId>,
  classes: Object,
}

class ResultListLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
        {
          this.props.detectorIds.map(id => (
            <ResultItemContainer
              key={id}
              detectorId={id}
              classes={{ root: classes.item }}
            />
          ))
        }
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    padding: theme.spacing.unit * 4,
  },
  item: {
    marginBottom: theme.spacing.unit * 2,
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

export default withStyles(styles)(ResultListLayout);
