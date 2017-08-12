/* @flow */

import React from 'react';
import router from 'utils/router';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import type { Version } from 'model/project';
import VersionItemLayout from '../components/VersionItemLayout';
import selector from '../selector';
import { actionCreator } from '../reducer';
import { actionCreator as workspaceActionCreator } from '../../Workspace/reducer';
import { mapActionsToVersionState } from '../enum';

type Props = {
  projectId: string,
  versionId: string,
  version: Version,
  startSimulation: () => void,
  setupWorkspace: () => void,
  createNewVersionFrom: () => void,
}

class VersionItemContainer extends React.Component {
  props: Props

  handlers = {
    useVersion: () => {
      this.props.createNewVersionFrom();
    },
    showResults: () => {
      const { projectId, versionId } = this.props;
      router.push(`/result/list/${projectId}/${versionId}`);
    },
    showErrors: () => {

    },
    startSimulation: this.props.startSimulation,
    modifySettings: () => {
      const { projectId, versionId } = this.props;
      router.push(`/project/settings/${projectId}/${versionId}`);
    },
  }

  loadIntoWorkspace = () => {
    this.props.setupWorkspace();
    router.push('/workspace/geometry');
  }


  render() {
    if (!this.props.version) {
      return <div />;
    }
    const buttonHandlers = mapActionsToVersionState
      .filter(item => _.includes(item.condition, this.props.version.status))
      .map(item => ({ label: item.label, handler: this.handlers[item.action] }));

    return (
      <VersionItemLayout
        {...this.props.version}
        loadIntoWorkspace={this.loadIntoWorkspace}
        buttonHandlers={buttonHandlers}
      />
    );
  }
}


const mapStateToProps = (state, props) => {
  return {
    version: selector.versionSelector(state, props.projectId, props.versionId),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    startSimulation: () => dispatch(
      actionCreator.startSimulation(props.projectId, props.versionId),
    ),
    setupWorkspace: () => dispatch(
      workspaceActionCreator.setupWorkspace(props.projectId, props.versionId),
    ),
    createNewVersionFrom: () => dispatch(
      actionCreator.createNewVersionFrom(props.projectId, props.versionId),
    ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VersionItemContainer);
