/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import router from 'utils/router';
import type { Store } from 'store/reducers';
import { List } from 'immutable';
import { LoadingCircle } from 'pages/Empty';

import { actionCreator } from '../reducer';
import ProjectListLayout from '../components/ProjectListLayout';
import selector from '../selector';

type Props = {
  projects: List<string>,
  fetchProjects: () => void,
  isFetchPending: bool,
}

class ProjectListContainer extends React.Component {
  props: Props;

  componentWillMount() {
    this.props.fetchProjects();
  }

  createNewProject = () => {
    router.push('project/new');
  }

  render() {
    if (this.props.isFetchPending) return <LoadingCircle />;
    return (
      <ProjectListLayout
        projects={this.props.projects}
        createNewProject={this.createNewProject}
      />
    );
  }
}

const mapStateToProps = (state: Store) => {
  return {
    projects: selector.projectListSelector(state),
    isFetchPending: state.project.get('isFetchProjectsPending', false),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchProjects: () => dispatch(actionCreator.fetchProjects()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectListContainer);
