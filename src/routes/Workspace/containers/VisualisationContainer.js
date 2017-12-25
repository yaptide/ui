/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import Visualisation, { processGeometry } from 'components/Visualisation';
import selector from '../selector';

type Props = {
  geometry: any,
  classes?: Object,
}

class VisualisationContainer extends React.Component<Props> {
  props: Props;

  render() {
    return (
      <Visualisation
        geometry={processGeometry(this.props.geometry)}
        classes={this.props.classes}
      />
    );
  }
}


const mapStateToProps = (state) => {
  return {
    geometry: selector.visualisationSelector(state),
  };
};

export default connect(
  mapStateToProps,
)(VisualisationContainer);
