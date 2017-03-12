/* @flow */

import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import type { Store } from 'store/reducers';
import { t } from 'i18n';
import Style from 'styles';

import selector from '../selector';
import { mapSimulationStateToColor } from '../enum';

type Props = {
  projectId: number,
  project: {
    name: string,
    description: string,
    lastBuildStatus: string,
  },
};

class ProjectListItem extends React.Component {
  props: Props;

  render() {
    const buildStatusColor = mapSimulationStateToColor[
      this.props.project.lastBuildStatus
    ];
    const buildStatusText = t(`project.status.${this.props.project.lastBuildStatus}`);
    return (
      <div style={styles.container} >
        <div style={{ ...styles.buildStatus, background: buildStatusColor }} />
        <div style={styles.detailsContainer} >
          <Link
            to={`/project/${this.props.projectId}`}
          >
            <p style={{ ...styles.projectName, color: buildStatusColor }}>
              {`${this.props.project.name} - ${buildStatusText}`}
            </p>
          </Link>
          <p style={styles.projectDescription}>
            {this.props.project.description}
          </p>
        </div>
        <div style={styles.buttonsContainer}>
          {/* <Button title="Delete"/> */}
        </div>
      </div>
    );
  }
}


const styles = {
  container: {
    ...Style.Flex.rootRow,
    alignItems: 'stretch',
    margin: Style.Dimens.spacing.normal,
    border: '1px solid',
    borderColor: Style.Colors.gray,
    overflow: 'auto',
  },
  buildStatus: {
    width: Style.Dimens.spacing.normal,
  },
  detailsContainer: {
    ...Style.Flex.elementEqual,
    padding: Style.Dimens.spacing.normal,
  },
  buttonsContainer: {
    padding: Style.Dimens.spacing.normal,
    width: '80px',
  },
  projectName: {
    fontSize: Style.Dimens.font.large,
    paddingBottom: Style.Dimens.spacing.normal,
  },
  projectDescription: {
    fontSize: Style.Dimens.font.standard,
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
    overflow: 'hidden',
  },
};

const mapStateToProps = (state: Store, props: { projectId: number }) => {
  return {
    project: selector.projectOverviewSelector(state, props.projectId),
  };
};

export default connect(
  mapStateToProps,
)(ProjectListItem);
