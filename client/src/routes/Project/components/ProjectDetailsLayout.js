/* @flow */

import React from 'react';
import Style from 'styles';
import type { Project } from 'model/project';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import VersionItemContainer from '../containers/VersionItemContainer';

type Props = {
  createVersionFromLatest: () => void,
} & Project

class ProjectDetailsLayout extends React.Component {
  props: Props

  render() {
    const versions = this.props.versionIds.reverse().map((version) => {
      return (
        <VersionItemContainer
          key={version}
          versionId={version}
          projectId={this.props.id}
        />
      );
    });

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.descriptionBlock}>
            <p style={styles.projectName}>{this.props.name}</p>
            <p style={styles.projectDescription}>{this.props.description}</p>
          </div>
          <FloatingActionButton onTouchTap={this.props.createVersionFromLatest} >
            <IconAdd />
          </FloatingActionButton>
        </div>
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
  header: {
    ...Style.Flex.rootRow,
  },
  descriptionBlock: {
    ...Style.Flex.rootColumn,
    ...Style.Flex.elementEqual,
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
