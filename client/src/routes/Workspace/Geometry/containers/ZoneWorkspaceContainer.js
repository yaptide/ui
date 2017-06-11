/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import ZoneWorkspaceLayout from '../components/ZoneWorkspaceLayout';
import selector from '../../selector';

type Props = {
  zoneIds: Array<number>,
}

class ZoneWorkspaceContainer extends React.Component {
  props: Props
  render() {
    return (
      <ZoneWorkspaceLayout zoneIds={this.props.zoneIds} />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    zoneIds: selector.allZonesIds(state).toJS(),
  };
};

export default connect(
  mapStateToProps,
)(ZoneWorkspaceContainer);
