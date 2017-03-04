/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Store } from 'store/reducers';
import { List } from 'immutable';
import AppLayout from 'pages/AppLayout';

import ProjectListLayout from '../components/ProjectListLayout';
import selector from '../selector';

type Props = {
  projects: List<number>,
}

class ProjectListContainer extends React.Component {
  props: Props;

  render() {
    return (
      <AppLayout>
        <ProjectListLayout
          projects={this.props.projects}
        />
      </AppLayout>
    );
  }
}

const mapStateToProps = (state: Store) => {
  return {
    projects: selector.projectListSelector(state),
  };
};

export default connect(
  mapStateToProps,
)(ProjectListContainer);
