/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import Visualisation, { processGeometry } from 'components/Visualisation';
import selector from '../../selector';

type Props = {
  geometry: any,
  style?: Object,
}

class VisualisationContainer extends React.Component {
  props: Props;

  render() {
    return (
      <Visualisation
        geometry={processGeometry(this.props.geometry)}
        style={this.props.style}
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
