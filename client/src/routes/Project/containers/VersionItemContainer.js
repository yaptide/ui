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
  versionId: number,
  version: Version,
  startSimulation: () => void,
  setupWorkspace: () => void,
  createNewVersionFrom: () => void,
}

class VersionItemContainer extends React.Component {
  props: Props

  handlers = {
    useVersion: (e: any) => {
      e.preventDefault();
      if (e.nativeEvent.button !== 0) return;
      this.props.createNewVersionFrom();
    },
    showResults: (e: any) => {
      e.preventDefault();
      if (e.nativeEvent.button !== 0) return;
      const { projectId, versionId } = this.props;
      router.push(`/result/list/${projectId}/${versionId}`);
    },
    showErrors: (e: any) => {
      e.preventDefault();
      // if (e.nativeEvent.button !== 0) return;
    },
    startSimulation: (e: any) => {
      e.preventDefault();
      if (e.nativeEvent.button !== 0) return;
      this.props.startSimulation();
    },
    modifySettings: (e: any) => {
      e.preventDefault();
      if (e.nativeEvent.button !== 0) return;
      const { projectId, versionId } = this.props;
      router.push(`/project/settings/${projectId}/${versionId}`);
    },
  }

  loadIntoWorkspace = (e: any) => {
    e.preventDefault();
    if (e.nativeEvent.button !== 0) return;
    this.props.setupWorkspace();
    router.push('/workspace/geometry');
  }


  render() {
    if (!this.props.version) {
      return <div />;
    }
    const buttonHandlers = mapActionsToVersionState
      .filter(item => _.includes(item.condition, this.props.version.status))
      .map(item => ({ label: item.label, handler: this.handlers[item.action], url: item.url }));

    return (
      <VersionItemLayout
        projectId={this.props.projectId}
        versionId={this.props.versionId}
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
