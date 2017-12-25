/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { SimulationOptions } from 'model/simulation/options';
import { Map } from 'immutable';
import WorkspaceOptionsLayout from '../components/WorkspaceOptionsLayout';
import { actionCreator } from '../../reducer';

type Props = {
  options: SimulationOptions,
  updateOptions: (options: SimulationOptions) => void,
  classes?: Object,
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
      <WorkspaceOptionsLayout
        options={this.props.options}
        updateOptionsField={this.updateOptionsField}
        classes={this.props.classes}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    options: state.workspace.get('options', Map()).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateOptions: options => dispatch(actionCreator.updateOptions(options)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WorkspaceOptionsContainer);
