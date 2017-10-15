/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import {
  FormV3DoubleInput,
  FormV3Input,
} from 'components/Form';
import type {
  DetectorGeometry,
  Geomap,
  Cylinder,
  Mesh,
  Zone,
  Plane,
} from 'model/simulation/detector';
import { t } from 'i18n';

type Props = {
  detector: DetectorGeometry,
  detectorErrors: Object,
  detectorUpdate: (field: string, value: Object) => void,
  classes: Object,
}

const coordinateValueLabels = [
  { label: 'x', field: 'x' },
  { label: 'y', field: 'y' },
  { label: 'z', field: 'z' },
];
const cylinderCoordinateValueLabels = [
  { label: 'radius', field: 'radius' },
  { label: 'angle', field: 'angle' },
  { label: 'z', field: 'z' },
];
const rangeValueLabel = [
  { label: 'min', field: 'min' },
  { label: 'max', field: 'max' },
];
// const radiusValueLabel = { label: 'radius', field: 'radius' };
// const heightValueLabel = { label: 'height', field: 'height' };
const EMPTY = {};

const GeomapDetectorGeometry = (props: Props & { detector: Geomap }) => (
  <div className={props.classes.root} >
    <FormV3Input
      field="center"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.center')}
      valueLabels={coordinateValueLabels}
      values={props.detector.center}
      valueError={props.detectorErrors.center || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3Input
      field="size"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.size')}
      valueLabels={coordinateValueLabels}
      values={props.detector.size}
      valueError={props.detectorErrors.size || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3Input
      field="slices"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.slices')}
      valueLabels={coordinateValueLabels}
      values={props.detector.slices}
      valueError={props.detectorErrors.slices || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
  </div>
);

const CylinderDetectorGeometry = (props: Props & { detector: Cylinder }) => (
  <div className={props.classes.root} >
    <FormV3DoubleInput
      field="radius"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.radius')}
      valueLabels={rangeValueLabel}
      values={props.detector.radius}
      valueError={props.detectorErrors.radius || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3DoubleInput
      field="angle"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.angle')}
      valueLabels={rangeValueLabel}
      values={props.detector.angle}
      valueError={props.detectorErrors.angle || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3DoubleInput
      field="zValue"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.z')}
      valueLabels={rangeValueLabel}
      values={props.detector.zValue}
      valueError={props.detectorErrors.zValue || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3Input
      field="slices"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.slices')}
      valueLabels={cylinderCoordinateValueLabels}
      values={props.detector.slices}
      valueError={props.detectorErrors.slices || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
  </div>
);

const MeshDetectorGeometry = (props: Props & { detector: Mesh }) => (
  <div className={props.classes.root} >
    <FormV3Input
      field="center"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.center')}
      valueLabels={coordinateValueLabels}
      values={props.detector.center}
      valueError={props.detectorErrors.center || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3Input
      field="size"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.size')}
      valueLabels={coordinateValueLabels}
      values={props.detector.size}
      valueError={props.detectorErrors.size || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3Input
      field="slices"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.slices')}
      valueLabels={coordinateValueLabels}
      values={props.detector.slices}
      valueError={props.detectorErrors.slices || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
  </div>
);

const PlaneDetectorGeometry = (props: Props & { detector: Plane }) => (
  <div className={props.classes.root} >
    <FormV3Input
      field="point"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.point')}
      valueLabels={coordinateValueLabels}
      values={props.detector.point}
      valueError={props.detectorErrors.point || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
    <FormV3Input
      field="normal"
      onUpdate={props.detectorUpdate}
      rowLabel={t('workspace.editor.normal')}
      valueLabels={coordinateValueLabels}
      values={props.detector.normal}
      valueError={props.detectorErrors.normal || EMPTY}
      numbersOnly
      classes={{ root: props.classes.item }}
    />
  </div>
);


const ZoneDetectorGeometry = (props: Props & { detector: Zone }) => (
  <div className={props.classes.root} >
    Detector not implemented
  </div>
);


const DetectorFormStyleHOC = withStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {},
}));

export default {
  geomap: DetectorFormStyleHOC((props: Props) => GeomapDetectorGeometry((props: any))),
  cylinder: DetectorFormStyleHOC((props: Props) => CylinderDetectorGeometry((props: any))),
  mesh: DetectorFormStyleHOC((props: Props) => MeshDetectorGeometry((props: any))),
  zone: DetectorFormStyleHOC((props: Props) => ZoneDetectorGeometry((props: any))),
  plane: DetectorFormStyleHOC((props: Props) => PlaneDetectorGeometry((props: any))),
};
