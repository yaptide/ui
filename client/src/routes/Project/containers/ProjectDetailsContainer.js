/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Store } from 'store/reducers';

import AppLayout from 'pages/AppLayout';
import type { ProjectDetails } from '../model';
import selector from '../selector';
import ProjectDetailsLayout from '../components/ProjectDetailsLayout';

type Props = {
  project: ProjectDetails,
};


class ProjectDetailsContainer extends React.Component {
  props: Props;
  render() {
    return (
      <AppLayout>
        <ProjectDetailsLayout {...this.props.project} />
      </AppLayout>
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
