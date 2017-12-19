/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Beam } from 'model/simulation/beam';
import { Map } from 'immutable';
import WorkspaceBeamLayout from '../components/WorkspaceBeamLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  beam: Beam,
  updateBeam: (beam: Beam) => void,
  particleOptions: Array<{value: string, name: string}>,
  classes: Object,
}

class WorkspaceBeamContainer extends React.Component<Props> {
  props: Props

  updateBeamField = (field: string, value: any) => {
    this.props.updateBeam({
      ...this.props.beam,
      [field]: value,
    });
  }

  render() {
    return (
      <WorkspaceBeamLayout
        beam={this.props.beam}
        updateBeamField={this.updateBeamField}
        particleOptions={this.props.particleOptions}
        classes={this.props.classes}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    beam: state.workspace.get('beam', Map()).toJS(),
    particleOptions: selector.allScoredParticleTypesPrinatable(state).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateBeam: beam => dispatch(actionCreator.updateBeam(beam)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WorkspaceBeamContainer);
