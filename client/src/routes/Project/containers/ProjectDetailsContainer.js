/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Store } from 'store/reducers';

import type { ProjectDetails } from 'model/project';
import selector from '../selector';
import ProjectDetailsLayout from '../components/ProjectDetailsLayout';

type Props = {
  project: ProjectDetails,
};


class ProjectDetailsContainer extends React.Component {
  props: Props;
  render() {
    return (
      <ProjectDetailsLayout {...this.props.project} />
    );
  }
}

const mapStateToProps = (state: Store) => {
  return {
    project: selector.projectDetailsSelector(state, 'wfnewofnwoe'),
  };
};

export default connect(
  mapStateToProps,
)(ProjectDetailsContainer);
