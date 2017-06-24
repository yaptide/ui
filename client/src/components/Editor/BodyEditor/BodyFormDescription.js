/* @flow */

import React from 'react';
import { t } from 'i18n';
import {
  FormV3Input,
  FormV3SingleInput,
} from 'components/Form';
import type {
  CuboidGeometry as CuboidGeometryType,
  SphereGeometry as SphereGeometryType,
  CylinderGeometry as CylinderGeometryType,
  GeometryType,
} from 'model/simulation/body';
import type { BodyGeometry } from 'model/simulation/zone';
import GeometryForm from './GeometryForm';

type Props = {
  geometry: BodyGeometry,
  geometryErrors: Object,
  typeUpdate: (type: GeometryType) => void,
  geometryUpdate: (field: string, value: Object) => void,
};

const coordinateValueLabels = [
  { label: 'x', field: 'x' },
  { label: 'y', field: 'y' },
  { label: 'z', field: 'z' },
];
const radiusValueLabel = { label: 'radius', field: 'radius' };
const heightValueLabel = { label: 'height', field: 'height' };
const EMPTY = {};

const CuboidGeometry = (props: Props & { geometry: CuboidGeometryType }) => (
  <GeometryForm
    onTypeChange={props.typeUpdate}
    type={props.geometry.type}
  >
    <FormV3Input
      field="center"
      onUpdate={props.geometryUpdate}
      rowLabel={t('workspace.editor.center')}
      valueLabels={coordinateValueLabels}
      values={props.geometry.center}
      valueError={props.geometryErrors.center || EMPTY}
      numbersOnly
    />
    <FormV3Input
      field="size"
      onUpdate={props.geometryUpdate}
      rowLabel={t('workspace.editor.size')}
      valueLabels={coordinateValueLabels}
      values={props.geometry.size}
      valueError={props.geometryErrors.size || EMPTY}
      numbersOnly
    />
  </GeometryForm>
);

const SphereGeometry = (props: Props & { geometry: SphereGeometryType }) => (
  <GeometryForm
    onTypeChange={props.typeUpdate}
    type={props.geometry.type}
  >
    <FormV3Input
      field="center"
      onUpdate={props.geometryUpdate}
      rowLabel={t('workspace.editor.center')}
      valueLabels={coordinateValueLabels}
      values={props.geometry.center}
      valueError={props.geometryErrors.center || EMPTY}
      numbersOnly
    />
    <FormV3SingleInput
      field="radius"
      onUpdate={props.geometryUpdate}
      rowLabel={t('workspace.editor.radius')}
      valueLabel={radiusValueLabel}
      value={props.geometry.radius}
      valueError={props.geometryErrors.radius}
      numbersOnly
    />
  </GeometryForm>
);

const CylinderGeometry = (props: Props & { geometry: CylinderGeometryType }) => (
  <GeometryForm
    onTypeChange={props.typeUpdate}
    type={props.geometry.type}
  >
    <FormV3Input
      field="baseCenter"
      onUpdate={props.geometryUpdate}
      rowLabel={t('workspace.editor.baseCenter')}
      valueLabels={coordinateValueLabels}
      values={props.geometry.baseCenter}
      valueError={props.geometryErrors.baseCenter || EMPTY}
      numbersOnly
    />
    <FormV3SingleInput
      field="radius"
      onUpdate={props.geometryUpdate}
      rowLabel={t('workspace.editor.radius')}
      valueLabel={radiusValueLabel}
      value={props.geometry.radius}
      valueError={props.geometryErrors.radius}
      numbersOnly
    />
    <FormV3SingleInput
      field="height"
      onUpdate={props.geometryUpdate}
      rowLabel={t('workspace.editor.height')}
      valueLabel={heightValueLabel}
      value={props.geometry.height}
      valueError={props.geometryErrors.height}
      numbersOnly
    />
  </GeometryForm>
);

const EmptyBodyDescription = (props: {
  geometry: BodyGeometry,
  typeUpdate: (type: GeometryType) => void,
}) => (
  <GeometryForm
    onTypeChange={props.typeUpdate}
    type={props.geometry.type}
  />
);

export default {
  cuboid: (props: Props) => CuboidGeometry((props: any)),
  sphere: (props: Props) => SphereGeometry((props: any)),
  cylinder: (props: Props) => CylinderGeometry((props: any)),
  empty: (props: Props) => EmptyBodyDescription((props: any)),
};
