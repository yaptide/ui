/* @flow */

import React from 'react';
import Style from 'styles';
import type { Project } from 'model/project';
import Button from 'material-ui/Button';
import IconAdd from 'material-ui-icons/Add';
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
            <p style={styles.projectDescription}>
              {
                this.props.description
                  .split('\n')
                  .map((item, key) => <span key={key}>{item}<br /></span>)
              }
            </p>
          </div>
          <Button
            onTouchTap={this.props.createVersionFromLatest}
            href={`#/project/${this.props.id}`}
          >
            <IconAdd />
          </Button>
        </div>
        {versions}
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  container: {
    alignItems: 'stretch',
    padding: Style.Dimens.spacing.large,
  },
  header: {
    ...Style.Flex.rootRow,
    alignItems: 'flex-start',
  },
  descriptionBlock: {
    ...Style.Flex.rootColumn,
    ...Style.Flex.elementEqual,
    marginRight: Style.Dimens.spacing.normal,
  },
  projectName: {
    fontSize: Style.Dimens.font.large,
    color: theme.palette.grey[200],
    paddingBottom: Style.Dimens.spacing.normal,
  },
  projectDescription: {
    color: theme.palette.grey[200],
    fontSize: Style.Dimens.font.standard,
  },
});

export default ProjectDetailsLayout;
