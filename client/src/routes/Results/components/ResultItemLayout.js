/* @flow */

import React from 'react';
import Style from 'styles';
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import type { DetectorResultsInfo, DetectorResultId } from 'model/result';
import * as _ from 'lodash';
import { t } from 'i18n';

type Props = {
  projectId: string,
  versionId: number,
  detectorId: DetectorResultId,
  detectorOverview: DetectorResultsInfo,
  goToDetectorScore: () => void,
  style?: Object,
}

class ResultItemLayout extends React.Component {
  props: Props

  render() {
    const { detectorId, projectId, versionId } = this.props;
    return (
      <Card style={this.props.style} zDepth={2} >
        <CardTitle
          title={this.props.detectorOverview.metadata.filename}
        />
        <CardActions>
          <RaisedButton
            primary
            label={t('result.goToDetectorScore')}
            onTouchTap={this.props.goToDetectorScore}
            href={`#/result/${detectorId}/${projectId}/${versionId}`}
          />
        </CardActions>
        <CardText>
          <p key="header" style={styles.infoTextHeader}>Detector dimensions</p>
          {
            _.map(this.props.detectorOverview.dimensions, (metadata, key) => {
              return <p key={key} style={styles.infoText} >{key}: {metadata}</p>;
            })
          }
        </CardText>
        <CardText>
          <p key="header" style={styles.infoTextHeader}>Detector metadata</p>
          {
            _.map(this.props.detectorOverview.metadata, (metadata, key) => {
              return <p key={key} style={styles.infoText} >{key}: {metadata}</p>;
            })
          }
        </CardText>
      </Card>
    );
  }
}

const styles = {
  infoText: {
    paddingBottom: Style.Dimens.spacing.min,
  },
  infoTextHeader: {
    paddingBottom: Style.Dimens.spacing.small,
    fontSize: Style.Dimens.font.large,
  },
};

export default ResultItemLayout;
