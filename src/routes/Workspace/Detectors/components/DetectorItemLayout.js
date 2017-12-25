/* @flow */

import React from 'react';
import { FormSelect } from 'components/Form';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import DeleteIcon from 'material-ui-icons/Delete';
import type { Detector } from 'model/simulation/detector';
import { t } from 'i18n';
import ParticleEditor from 'components/Editor/ParticleEditor';
import DetectorGeometryItemLayout from './DetectorGeometryItemLayout';
import DetectorScoringItemLayout from './DetectorScoringItemLayout';

type Props = {
  detector: Detector,
  updateType: (type: string) => void,
  geometryUpdate: (value: Object, type: string) => void,
  particleUpdate: (value: Object) => void,
  scoringUpdate: (value: Object) => void,
  deleteDetector: () => void,
  particleOptions: Array<{value: string, name: string}>,
  classes: Object,
}

class DetectorItemLayout extends React.Component<Props> {
  props: Props

  render() {
    const { classes, detector } = this.props;
    const DetectorGeometry = DetectorGeometryItemLayout[
      detector.detectorGeometry && detector.detectorGeometry.type
    ];
    const detectorGeometry = DetectorGeometry
      ? (
        <DetectorGeometry
          detector={detector.detectorGeometry}
          detectorErrors={{}}
          detectorUpdate={this.props.geometryUpdate}
        />
      ) : null;
    return (
      <Paper
        className={classes.root}
        elevation={4}
      >
        <FormSelect
          type="detectorGeometry"
          value={detector.detectorGeometry && detector.detectorGeometry.type}
          label={t('workspace.editor.geometryType')}
          onChange={this.props.updateType}
          options={geometryOptions}
          classes={{ root: classes.select }}
        />
        {detectorGeometry}
        <ParticleEditor
          particle={detector.particle}
          particleUpdate={this.props.particleUpdate}
          particleOptions={this.props.particleOptions}
        />
        <DetectorScoringItemLayout
          scoring={detector.scoring}
          scoringUpdate={this.props.scoringUpdate}
        />
        <div className={classes.btnRow}>
          <Button
            color="contrast"
            onTouchTap={this.props.deleteDetector}
            raised
          >
            <DeleteIcon />
          </Button>
        </div>
      </Paper>
    );
  }
}

const geometryOptions = [
  { field: 'mesh', label: t('workspace.editor.mesh') },
  { field: 'cylinder', label: t('workspace.editor.cylinder') },
  { field: 'plane', label: t('workspace.editor.plane') },
  { field: 'zone', label: t('workspace.editor.zone') },
  { field: 'geomap', label: t('workspace.editor.geomap') },
];

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: theme.spacing.unit * 2,
  },
  select: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  btnRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default withStyles(styles)(DetectorItemLayout);
