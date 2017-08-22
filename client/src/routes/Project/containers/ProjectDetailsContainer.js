/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Store } from 'store/reducers';

import type { Project } from 'model/project';
import selector from '../selector';
import { actionCreator } from '../reducer';
import ProjectDetailsLayout from '../components/ProjectDetailsLayout';

type Props = {
  project: Project,
  fetchProjects: () => void,
  createVersionFromLatest: () => void,
};


class ProjectDetailsContainer extends React.Component {
  props: Props

  componentWillMount() {
    this.props.fetchProjects();
  }


  render() {
    if (!this.props.project) {
      return <div />;
    }
    return (
      <ProjectDetailsLayout
        createVersionFromLatest={this.props.createVersionFromLatest}
        {...this.props.project}
      />
    );
  }
}

const mapStateToProps = (state: Store, props: Object) => {
  return {
    project: selector.projectSelector(state, props.params.projectId),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createVersionFromLatest: () => (
      dispatch(actionCreator.createNewVersion(props.params.projectId))
    ),
    fetchProjects: () => dispatch(actionCreator.ensureProjects()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectDetailsContainer);
