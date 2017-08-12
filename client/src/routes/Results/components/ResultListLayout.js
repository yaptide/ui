/* @flow */

import React from 'react';
import Style from 'styles';
import type { DetectorResultId } from 'model/result';
import ResultItemContainer from '../containers/ResultItemContainer';

type Props = {
  detectorIds: Array<DetectorResultId>,
}

class ResultListLayout extends React.Component {
  props: Props
  render() {
    return (
      <div>
        {
          this.props.detectorIds.map(id => (
            <ResultItemContainer
              key={id}
              detectorId={id}
              style={styles.item}
            />
          ))
        }
      </div>
    );
  }
}

const styles = {
  item: {
    margin: Style.Dimens.spacing.large,
  },
};

export default ResultListLayout;
