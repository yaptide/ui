/* @flow */

import React from 'react';
import Style from 'styles';
import type { ProjectDetails } from '../model';
import ProjectVersionListItem from './ProjectVersionListItem';

type Props = {
} & ProjectDetails

class ProjectDetailsLayout extends React.Component {
  props: Props;

  render() {
    const versions = this.props.versions.reverse().map((e, i) => {
      return (
        <ProjectVersionListItem key={i} {...e} />
      );
    });

    return (
      <div style={styles.container}>
        <p style={styles.projectName}>{this.props.name}</p>
        <p style={styles.projectDescription}>{this.props.description}</p>
        {versions}
      </div>
    );
  }
}

const styles = {
  container: {
    alignItems: 'stretch',
    padding: Style.Dimens.spacing.large,
  },
  projectName: {
    fontFamily: Style.Theme.fontFamily,
    fontSize: Style.Dimens.font.large,
    color: Style.Theme.palette.textColor,
    paddingBottom: Style.Dimens.spacing.normal,
  },
  projectDescription: {
    color: Style.Theme.palette.textColor,
    fontFamily: Style.Theme.fontFamily,
    fontSize: Style.Dimens.font.standard,
  },
};

export default ProjectDetailsLayout;
