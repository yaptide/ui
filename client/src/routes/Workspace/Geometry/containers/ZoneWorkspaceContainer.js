/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import ZoneWorkspaceLayout from '../components/ZoneWorkspaceLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  zoneIds: Array<number>,
  addZone: () => void,
  goToParentLayer: () => void,
}

class ZoneWorkspaceContainer extends React.Component {
  props: Props
  render() {
    return (
      <ZoneWorkspaceLayout
        zoneIds={this.props.zoneIds}
        addZone={this.props.addZone}
        goToParentLayer={this.props.goToParentLayer}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    zoneIds: selector.allCurrentLayerZonesIds(state).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addZone: () => dispatch(actionCreator.createZone()),
    goToParentLayer: () => dispatch(actionCreator.goToParentLayer()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ZoneWorkspaceContainer);
