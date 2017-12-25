/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import WorkspaceGeometryLayout from '../components/WorkspaceGeometryLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  zoneIds: Array<number>,
  addZone: () => void,
  goToParentLayer: () => void,
  classes?: Object,
}

class WorkspaceGeometryContainer extends React.Component<Props> {
  props: Props

  render() {
    return (
      <WorkspaceGeometryLayout
        zoneIds={this.props.zoneIds}
        addZone={this.props.addZone}
        goToParentLayer={this.props.goToParentLayer}
        classes={this.props.classes}
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
)(WorkspaceGeometryContainer);
