/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import type { Score, DimensionsInfo } from 'model/result';
import type { Detector } from 'model/simulation/detector';
import { ChartInterface } from 'components/Chart';
import { generateDetectorChartLabels } from 'utils/simulation/detectorInfo';
import AppLayout from 'pages/AppLayout';

type Props = {
  setup: Detector,
  scored: Score,
  dimensions: DimensionsInfo,
  classes: Object,
}

class ResultDetailsLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <AppLayout classes={{ root: classes.layout }}>
        <div className={classes.root} >
          <Paper className={classes.item} elevation={4} >
            <ChartInterface
              data={this.props.scored}
              numberOfDimensions={this.props.dimensions.numberOfDimensions}
              classes={{ root: classes.chart }}
              labels={generateDetectorChartLabels(this.props.setup)}
            />
          </Paper>
          {
            // TODO: remove this whenall data hav implemented representation
            /*
          this.props.scored.map((scored2) => {
              const block = scored2.map((scored1) => {
                return <p>{`[${scored1.join(', ')}]`}</p>;
              });
              return [<p>[</p>, ...block, <p>],</p>];
            })
            */
          }
        </div>
      </AppLayout>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: theme.spacing.unit * 4,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  chart: {
    flex: 1,
  },
  layout: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export default withStyles(styles)(ResultDetailsLayout);
