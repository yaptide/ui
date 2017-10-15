/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import type { Score, DimensionsInfo } from 'model/result';
import { ChartInterface } from 'components/Chart';
import { generateDetectorChartLabels } from 'utils/simulation/detectorInfo';

type Props = {
  scored: Score,
  dimensions: DimensionsInfo,
  classes: Object,
}

class ResultDetailsLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
        <Paper className={classes.item} elevation={4} >
          <ChartInterface
            data={this.props.scored}
            numberOfDimensions={this.props.dimensions.numberOfDimensions}
            classes={{ hoc: classes.chart }}
            labels={generateDetectorChartLabels(({ name: 'test', shape: null }: any))}
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
});

export default withStyles(styles)(ResultDetailsLayout);
