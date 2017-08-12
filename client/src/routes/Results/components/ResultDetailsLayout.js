/* @flow */

import React from 'react';
import type { Score } from 'model/result';

type Props = {
  scored: Score,
}

class ResultDetailsLayout extends React.Component {
  props: Props
  render() {
    return (
      <div>
        {
            this.props.scored.map((scored2) => {
              const block = scored2.map((scored1) => {
                return <p>{`[${scored1.join(', ')}]`}</p>;
              });
              return [<p>[</p>, ...block, <p>],</p>];
            })
        }
      </div>
    );
  }
}

export default ResultDetailsLayout;
