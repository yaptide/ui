/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import ZoneWorkspaceLayout from '../components/ZoneWorkspaceLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  zoneIds: Array<number>,
  addZone: () => void,
}

class ZoneWorkspaceContainer extends React.Component {
  props: Props
  render() {
    return (
      <ZoneWorkspaceLayout
        zoneIds={this.props.zoneIds}
        addZone={this.props.addZone}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    zoneIds: selector.allZonesIds(state).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addZone: () => dispatch(actionCreator.createZone()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ZoneWorkspaceContainer);
