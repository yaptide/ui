/* @flow */

import { Map, Seq, fromJS } from 'immutable';
import type { ConstructionPath, Body } from 'model/simulation/zone';
import type { Material } from 'model/simulation/material';
import serializer from './bodySerializer';
import materialSerializer from './materialSerializer';

function visualisationSelector(state: { workspace: Map<string, any> }) {
  const parentId = state.workspace.get('zoneLayerParent');
  const zones = state.workspace.get('zones', Seq()).filter(item => item.get('parentId') === parentId);
  return state.workspace.set('zones', zones);
}

function allZonesIds(state: { workspace: Map<string, any> }) {
  return state.workspace
    .get('zones', Map())
    .valueSeq()
    .map(item => item.get('id'));
}

function allMaterialIds(state: { workspace: Map<string, any> }) {
  return state.workspace
    .get('materials', Map())
    .valueSeq()
    .map(item => item.get('id'));
}

function allDetectorsIds(state: { workspace: Map<string, any> }) {
  return state.workspace
    .get('detectors', Map())
    .valueSeq()
    .map(item => item.get('id'));
}

function allSelectedMaterialsPrintable(
  state: { configuration: Map<string, any>, workspace: Map<string, any> },
) {
  return state.workspace.get('materials', Map())
    .valueSeq()
    .map(item => Map({ id: item.get('id'), ...constructMaterialLabel(item.toJS(), state.configuration) }));
}

function constructMaterialLabel(item: Material, configuration: Map<string, any>) {
  return { label: materialSerializer(item, configuration), color: item.color };
}

function allPredefinedMaterialsPrintable(state: { configuration: Map<string, any> }) {
  const predefinedMaterials = state.configuration.get('predefinedMaterials', Map());
  const order = state.configuration.get('predefinedMaterialsOrder', Seq());
  return order.map(item => predefinedMaterials.get(item));
}

function allIsotopesPrintable(state: { configuration: Map<string, any> }) {
  const isotopes = state.configuration.get('isotopes', Map());
  const order = state.configuration.get('isotopesOrder', Seq());
  return order.map(item => isotopes.get(item));
}

function allScoredParticleTypesPrinatable(state: { configuration: Map<string, any> }) {
  const particles = state.configuration.get('particles', Map());
  const order = state.configuration.get('particlesOrder', Seq());
  return order.map(item => particles.get(item));
}

function allScoringTypesPrintable(state: { configuration: Map<string, any> }) {
  const particles = state.configuration.get('scoringTypes', Map());
  const order = state.configuration.get('scoringTypesOrder', Seq());
  return order.map(item => particles.get(item));
}

function allCurrentLayerZonesIds(state: { workspace: Map<string, any> }) {
  const parentId = state.workspace.get('zoneLayerParent');
  return state.workspace
    .get('zones', Map())
    .valueSeq()
    .filter(item => item.get('parentId') === parentId)
    .map(item => item.get('id'));
}

function zoneById(state: { workspace: Map<string, any> }, zoneId: number): Map<string, any> {
  return state.workspace.getIn(['zones', String(zoneId)], Map());
}

function bodyById(state: { workspace: Map<string, any> }, zoneId: number): Map<string, any> {
  return state.workspace.getIn(['bodies', String(zoneId)], Map());
}

function materialById(
  state: { workspace: Map<string, any> }, materialId: number,
): Map<string, any> {
  return state.workspace.getIn(['materials', String(materialId)], Map());
}

function detectorById(
  state: { workspace: Map<string, any> }, detectorId: number,
): Map<string, any> {
  return state.workspace.getIn(['detectors', String(detectorId)], Map());
}

function materialByIdPrintable(
  state: {
    workspace: Map<string, any>,
    configuration: Map<string, any>,
  },
  materialId: number,
): string {
  const materialType = materialById(state, materialId).getIn(['materialInfo', 'predefinedId']);
  const label = state.configuration.getIn(['predefinedMaterials', materialType, 'name'], 'unknown material');
  return label;
}

function zoneByIdPrintable(
  state: { workspace: Map<string, any> },
  zoneId: number,
): Map<string, any> {
  let zone = zoneById(state, zoneId);

  const baseBody = bodyById(state, zone.get('baseId')).toJS();
  zone = zone.set('base', fromJS({ bodyId: zone.get('baseId'), label: serializer(baseBody) }));
  zone.get('construction').forEach((item, index) => {
    const body: Body = bodyById(state, item.get('bodyId')).toJS();
    zone = zone.setIn(['construction', index, 'body'], fromJS({ bodyId: item.get('bodyId'), label: serializer(body) }));
  });
  return zone;
}

function bodyByConstructionPath(state: { workspace: Map<string, mixed> }, path: ConstructionPath) {
  if (!path) { return Map(); }
  const workspace = state.workspace;
  const bodyId = workspace.getIn([
    'zones',
    String(path.zoneId),
    ...(path.base ? ['baseId'] : ['construction', path.construction, 'bodyId']),
  ]);
  const body = workspace.getIn(['bodies', String(bodyId)], Map());
  return body;
}

function isWorkspaceLoading(state: { workspace: Map<string, mixed> }) {
  const dataStatus = state.workspace.get('dataStatus');
  return dataStatus === 'none' || dataStatus === 'loading';
}

export default {
  visualisationSelector,
  bodyByConstructionPath,
  allZonesIds,
  allMaterialIds,
  allDetectorsIds,
  allCurrentLayerZonesIds,
  zoneById,
  bodyById,
  materialById,
  zoneByIdPrintable,
  materialByIdPrintable,
  detectorById,
  allSelectedMaterialsPrintable,
  allPredefinedMaterialsPrintable,
  allIsotopesPrintable,
  allScoredParticleTypesPrinatable,
  allScoringTypesPrintable,
  isWorkspaceLoading,
};
