/* @flow */

import React from 'react';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import type { DetectorResultsInfo, DetectorResultId } from 'model/result';
import * as _ from 'lodash';
import { t } from 'i18n';

type Props = {
  projectId: string,
  versionId: number,
  detectorId: DetectorResultId,
  detectorOverview: DetectorResultsInfo,
  goToDetectorScore: () => void,
  classes: Object,
}

class ResultItemLayout extends React.Component<Props> {
  props: Props

  render() {
    const { detectorId, projectId, versionId, classes } = this.props;
    return (
      <Card className={classes.root} elevation={4} >
        <CardHeader
          title={this.props.detectorOverview.metadata.filename}
        />
        <CardActions>
          <Button
            color="primary"
            raised
            onTouchTap={this.props.goToDetectorScore}
            href={`#/result/${detectorId}/${projectId}/${versionId}`}
          >
            {t('result.goToDetectorScore')}
          </Button>
        </CardActions>
        <CardContent>
          <p key="header" className={classes.infoTextHeader}>Detector dimensions</p>
          {
            _.map(this.props.detectorOverview.dimensions, (metadata, key) => {
              return <p key={key} className={classes.infoText} >{key}: {metadata}</p>;
            })
          }
        </CardContent>
        <CardContent>
          <p key="header" className={classes.infoTextHeader}>Detector metadata</p>
          {
            _.map(this.props.detectorOverview.metadata, (metadata, key) => {
              return <p key={key} className={classes.infoText} >{key}: {metadata}</p>;
            })
          }
        </CardContent>
      </Card>
    );
  }
}

const styles = (theme: Object) => ({
  root: {},
  infoText: {
    paddingBottom: theme.spacing.unit,
  },
  infoTextHeader: {
    paddingBottom: theme.spacing.unit,
  },
});

export default withStyles(styles)(ResultItemLayout);
