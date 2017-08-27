/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import type { Score, DimensionsInfo } from 'model/result';
import Style from 'styles';
import { ChartInterface } from 'components/Chart';
import { generateDetectorChartLabels } from 'utils/simulation/detectorInfo';

type Props = {
  scored: Score,
  dimensions: DimensionsInfo,
}

class ResultDetailsLayout extends React.Component {
  props: Props
  render() {
    return (
      <div style={styles.container} >
        <Paper elevation={4} >
          <ChartInterface
            data={this.props.scored}
            numberOfDimensions={this.props.dimensions.numberOfDimensions}
            style={styles.chart}
            labels={generateDetectorChartLabels({ name: 'test', shape: null })}
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

const styles = {
  container: {
    padding: '30px',
  },
  chart: {
    ...Style.Flex.elementEqual,
    margin: '20px',
  },
};

export default ResultDetailsLayout;
