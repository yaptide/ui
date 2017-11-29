/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import WorkspaceLayout from 'pages/WorkspaceLayout';
import type { SimulationOptions } from 'model/simulation/options';
import { Map } from 'immutable';
import WorkspaceOptionsLayout from '../components/WorkspaceOptionsLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  isWorkspaceLoading: bool,
  fetchSimulationSetup: () => void,
  options: SimulationOptions,
  updateOptions: (options: SimulationOptions) => void,
}

class WorkspaceOptionsContainer extends React.Component<Props> {
  props: Props

  updateOptionsField = (field: string, value: any) => {
    this.props.updateOptions({
      ...this.props.options,
      [field]: value,
    });
  }

  render() {
    return (
      <WorkspaceLayout
        isWorkspaceLoading={this.props.isWorkspaceLoading}
        activeWorkspaceTab="options"
      >
        {
          this.props.isWorkspaceLoading
            ? null
            : <WorkspaceOptionsLayout
              options={this.props.options}
              updateOptionsField={this.updateOptionsField}
            />
        }
      </WorkspaceLayout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isWorkspaceLoading: selector.isWorkspaceLoading(state),
    options: state.workspace.get('options', Map()).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSimulationSetup: () => dispatch(actionCreator.fetchSimulationSetup()),
    updateOptions: options => dispatch(actionCreator.updateOptions(options)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WorkspaceOptionsContainer);
