/* @flow */

import { Map, fromJS } from 'immutable';

import type {
  Body,
  ConstructionPath,
  OperationType,
} from 'model/simulation/zone';
import type {
  Material,
} from 'model/simulation/material';
import type {
  Detector,
} from 'model/simulation/detector';
import type {
  Beam,
} from 'model/simulation/beam';
import type {
  SimulationOptions,
} from 'model/simulation/options';
import localStorage, { key as storageKey } from 'store/localStorage';
import stateProcessor from './reducerHelpers';

export const actionType = {
  SYNC_WORKSPACE_WITH_SERVER: 'SYNC_WORKSPACE_WITH_SERVER',
  UPDATE_SIMULATION_SETUP_SUCCESS: 'UPDATE_SIMULATION_SETUP_SUCCESS',
  UPDATE_SIMULATION_SETUP_ERROR: 'UPDATE_SIMULATION_SETUP_ERROR',

  SETUP_WORKSPACE: 'SETUP_WORKSPACE',
  FETCH_SIMULATION_SETUP: 'FETCH_SIMULATION_SETUP',
  FETCH_SIMULATION_SETUP_PENDING: 'FETCH_SIMULATION_SETUP_PENDING',
  FETCH_SIMULATION_SETUP_SUCCESS: 'FETCH_SIMULATION_SETUP_SUCCESS',
  FETCH_SIMULATION_SETUP_ERROR: 'FETCH_SIMULATION_SETUP_ERROR',

  CREATE_ZONE: 'CREATE_ZONE',
  DELETE_ZONE: 'DELETE_ZONE',
  CHANGE_ZONE_OPERATION_TYPE: 'CHANGE_ZONE_OPERATION_TYPE',
  CREATE_ZONE_OPERATION: 'CREATE_ZONE_OPERATION',
  DELETE_ZONE_OPERATION: 'DELETE_ZONE_OPERATION',
  UPDATE_ZONE_FIELD: 'UPDATE_ZONE_FIELD',

  CREATE_BODY_IN_ZONE: 'CREATE_BODY_IN_ZONE',

  UPDATE_BODY: 'UPDATE_BODY',

  CREATE_MATERIAL: 'CREATE_MATERIAL',
  DELETE_MATERIAL: 'DELETE_MATERIAL',
  UPDATE_MATERIAL: 'UPDATE_MATERIAL',

  CREATE_DETECTOR: 'CREATE_DETECTOR',
  DELETE_DETECTOR: 'DELETE_DETECTOR',
  UPDATE_DETECTOR: 'UPDATE_DETECTOR',

  UPDATE_BEAM: 'UPDATE_BEAM',
  UPDATE_OPTIONS: 'UPDATE_OPTIONS',

  MOVE_TO_CHILD_LAYER: 'MOVE_TO_CHILD_LAYER',
  MOVE_TO_PARENT_LAYER: 'MOVE_TO_PARENT_LAYER',
};

const ACTION_HANDLERS = {
  [actionType.SYNC_WORKSPACE_WITH_SERVER]: state => state.set('isServerSyncPending', true),
  [actionType.UPDATE_SIMULATION_SETUP_SUCCESS]: state => state.set('isServerSyncPending', false),
  [actionType.UPDATE_SIMULATION_SETUP_ERROR]: (state, action) => (
    state.set('isServerSyncPending', false).set('serverSyncError', action.error)
  ),
  [actionType.SETUP_WORKSPACE]: (state, action) => (
    fromJS({ projectId: action.projectId, versionId: action.versionId, ...emptyState() })
  ),
  [actionType.FETCH_SIMULATION_SETUP]: state => (
    state.merge({
      dataStatus: state.get('dataStatus') === 'none' ? 'pendingReducer' : state.get('dataStatus'),
    })
  ),
  [actionType.FETCH_SIMULATION_SETUP_PENDING]: state => state.merge({ dataStatus: 'pendingReducer' }),
  [actionType.FETCH_SIMULATION_SETUP_SUCCESS]: (state, action) => (
    state.merge({ dataStatus: 'ready', ...action.geometry })
  ),
  [actionType.FETCH_SIMULATION_SETUP_ERROR]: state => state.merge({ dataStatus: 'error' }),
  [actionType.CREATE_ZONE]: state => stateProcessor.zone.create(state),
  [actionType.DELETE_ZONE]: (state, action) => stateProcessor.zone.delete(state, action.zoneId),
  [actionType.CHANGE_ZONE_OPERATION_TYPE]: (state, action) => (
    stateProcessor.zone.changeOperationType(
      state,
      action.operationType,
      action.zoneConstructionPath,
    )
  ),
  [actionType.CREATE_ZONE_OPERATION]: (state, action) => (
    stateProcessor.zone.createOperation(state, action.zoneConstructionPath)
  ),
  [actionType.DELETE_ZONE_OPERATION]: (state, action) => (
    stateProcessor.zone.deleteOperation(state, action.zoneConstructionPath)
  ),
  [actionType.UPDATE_ZONE_FIELD]: (state, action) => (
    state.setIn(['zones', String(action.zoneId), action.valueType], fromJS(action.value))
  ),
  [actionType.CREATE_BODY_IN_ZONE]: (state, action) => (
    stateProcessor.body.createInZone(state, action.body, action.zoneConstructionPath)
  ),
  [actionType.UPDATE_BODY]: (state, action) => (
    stateProcessor.body.update(state, action.body)
  ),
  [actionType.CREATE_MATERIAL]: (state, action) => (
    stateProcessor.material.create(state, action.material)
  ),
  [actionType.UPDATE_MATERIAL]: (state, action) => (
    stateProcessor.material.update(state, action.material)
  ),
  [actionType.DELETE_MATERIAL]: (state, action) => (
    stateProcessor.material.delete(state, action.materialId)
  ),
  [actionType.CREATE_DETECTOR]: state => (
    stateProcessor.detector.create(state)
  ),
  [actionType.DELETE_DETECTOR]: (state, action) => (
    stateProcessor.detector.delete(state, action.detectorId)
  ),
  [actionType.UPDATE_DETECTOR]: (state, action) => (
    stateProcessor.detector.update(state, action.detector)
  ),
  [actionType.UPDATE_BEAM]: (state, action) => (
    state.set('beam', fromJS(action.beam))
  ),
  [actionType.UPDATE_OPTIONS]: (state, action) => (
    state.set('options', fromJS(action.options))
  ),
  [actionType.MOVE_TO_PARENT_LAYER]: (state) => {
    const currentZoneId = state.get('zoneLayerParent');
    if (!currentZoneId) {
      return state;
    }
    const parentId = state.getIn(['zones', String(currentZoneId), 'parentId']);
    return state.set('zoneLayerParent', parentId);
  },
  [actionType.MOVE_TO_CHILD_LAYER]: (state, action) => (
    state.set('zoneLayerParent', action.zoneId)
  ),
};

export const actionCreator = {
  setupWorkspace(projectId: string, versionId: number) {
    return { type: actionType.SETUP_WORKSPACE, projectId, versionId };
  },
  syncServerWithLocal() {
    return { type: actionType.SYNC_WORKSPACE_WITH_SERVER };
  },
  fetchSimulationSetup() {
    return { type: actionType.FETCH_SIMULATION_SETUP };
  },
  createZone() {
    return { type: actionType.CREATE_ZONE };
  },
  deleteZone(zoneId: number) {
    return { type: actionType.DELETE_ZONE, zoneId };
  },
  changeOperationType(type: OperationType, path: ConstructionPath) {
    return {
      type: actionType.CHANGE_ZONE_OPERATION_TYPE,
      operationType: type,
      zoneConstructionPath: path,
    };
  },
  createZoneOperation(path: ConstructionPath) {
    return { type: actionType.CREATE_ZONE_OPERATION, zoneConstructionPath: path };
  },
  deleteZoneOperation(path: ConstructionPath) {
    return { type: actionType.DELETE_ZONE_OPERATION, zoneConstructionPath: path };
  },
  updateZoneField(id: number, valueType: string, value: any) {
    return {
      type: actionType.UPDATE_ZONE_FIELD,
      zoneId: id,
      valueType,
      value,
    };
  },
  createBodyInZone(body: Body, path: ConstructionPath) {
    return { type: actionType.CREATE_BODY_IN_ZONE, body, zoneConstructionPath: path };
  },
  updateBody(body: Body) {
    return { type: actionType.UPDATE_BODY, body };
  },
  createMaterial(material: Material) {
    return { type: actionType.CREATE_MATERIAL, material };
  },
  updateMaterial(material: Material) {
    return { type: actionType.UPDATE_MATERIAL, material };
  },
  deleteMaterial(materialId: number) {
    return { type: actionType.DELETE_MATERIAL, materialId };
  },
  createDetector() {
    return { type: actionType.CREATE_DETECTOR };
  },
  deleteDetector(detectorId: number) {
    return { type: actionType.DELETE_DETECTOR, detectorId };
  },
  updateDetector(detector: Detector) {
    return { type: actionType.UPDATE_DETECTOR, detector };
  },
  updateBeam(beam: Beam) {
    return { type: actionType.UPDATE_BEAM, beam };
  },
  updateOptions(options: SimulationOptions) {
    return { type: actionType.UPDATE_OPTIONS, options };
  },
  goToParentLayer() {
    return { type: actionType.MOVE_TO_PARENT_LAYER };
  },
  goToChildLayer(zoneId?: number) {
    return { type: actionType.MOVE_TO_CHILD_LAYER, zoneId };
  },
};

const emptyState = () => ({
  zoneLayerParent: 0,
  singleLayerView: true,
  dataStatus: 'none',
});

const initialState = fromJS({
  zoneLayerParent: 0,
  singleLayerView: true,
  zones: {
    '1': { id: 1, name: 'zone 1', parentId: 0, children: [], materialId: 1, baseId: 1, construction: [{ type: 'subtract', bodyId: 2 }] },
    '2': { id: 2, name: 'zone 2', parentId: 0, children: [], materialId: 2, baseId: 3, construction: [{ type: 'union', bodyId: 4 }] },
    '3': { id: 3, name: 'zone 3', parentId: 1, children: [], materialId: 1, baseId: 1, construction: [] },
  },
  bodies: {
    '1': { id: 1, geometry: { type: 'sphere', center: { x: 5, y: 5, z: 5 }, radius: 3 } },
    '2': { id: 2, geometry: { type: 'cylinder', height: 10, baseCenter: { x: 5, y: 0, z: 5 }, radius: 1 } },
    '3': { id: 3, geometry: { type: 'cylinder', height: 20, baseCenter: { x: -10, y: 0, z: 10 }, radius: 3 } },
    '4': { id: 4, geometry: { type: 'cuboid', center: { x: -10, y: -3, z: 10 }, size: { x: 20, y: 6, z: 20 } } },
  },
  materials: {
    '1': { id: 1, color: { r: 0x80, g: 0x80, b: 0x80, a: 0xFF }, materialInfo: { type: 'predefined', predefinedId: 'hydrogen', density: 1000 } },
    '2': { id: 2, color: { r: 0x80, g: 0x80, b: 0x80, a: 0xFF }, materialInfo: { type: 'predefined', predefinedId: 'helium', density: 10, stateOfMatter: 'liquid' } },
    '3': {
      id: 3,
      color: { r: 0x80, g: 0x80, b: 0x80, a: 0xFF },
      materialInfo: {
        type: 'compound',
        name: 'some compund',
        stateOfMatter: 'gas',
        density: 11,
        elements: [
          { isotope: 'he-3', relativeStochiometricFraction: 1, atomicValue: 11, iValue: 20 },
          { isotope: 'he-3', relativeStochiometricFraction: 1, atomicValue: 11 },
          { isotope: 'he-3', relativeStochiometricFraction: 1, iValue: 20 },
          { isotope: 'he-3', relativeStochiometricFraction: 1 },
        ],
      },
    },
    '4': {
      id: 4,
      color: { r: 0x80, g: 0x80, b: 0x80, a: 0xFF },
      materialInfo: {
        type: 'compound',
        name: 'another compound',
        stateOfMatter: 'solid',
        density: 100,
        elements: [
          { isotope: 'he-3', relativeStochiometricFraction: 1, atomicValue: 11, iValue: 20 },
        ],
      },
    },
  },
  detectors: {
    '1': {
      id: 1,
      detectorGeometry: { type: 'mesh', center: { x: 1, y: 2, z: 3 }, size: { x: 3, y: 3, z: 3 }, slices: { x: 10, y: 10, z: 10 } },
      particle: { type: 'all' },
      scoring: { type: 'energy' },
    },
    '2': {
      id: 2,
      detectorGeometry: { type: 'cylinder', radius: { max: 10, min: 0 }, angle: { max: Math.PI * 1.5, min: Math.PI / 2 }, zValue: { max: 10, min: -10 }, slices: { radius: 1, angle: 1, z: 1 } },
      particle: { type: 'heavy_ion', charge: 10, nucleonsCount: 10 },
      scoring: { type: 'tlet', material: 0 },
    },
  },
  beam: {
    direction: { phi: 0, theta: 0, position: { x: 0, y: 0, z: 0 } },
    divergence: { sigmaX: 1, sigmaY: 1, distribution: '' },
    particleType: { type: '' },
    initialBaseEnergy: 0,
    initialEnergySigma: 0,
  },
  options: {
    antyparticleCorrectionOn: false,
    nuclearCorectionOn: false,
    meanEnergyLoss: 0,
    minEnergyLoss: 0,
    scatteringType: '',
    energyStraggling: '',
    fastNeutronTransportOn: false,
    lowEnergyNeutronCutOff: false,
    recordSecondaryNeutronCreation: false,
    numberOfRecordedParticles: 1000,
    numberOfGeneratedParticles: 1000,
  },
});
export const reducer = (state: Map<string, any>, action: { type: string }) => {
  const handler = ACTION_HANDLERS[action.type];
  const persistedState = localStorage.get(storageKey.WORKSPACE_SYNC);
  if (!handler) {
    return state || fromJS(persistedState) || initialState;
  }
  if (state) {
    const newState = handler(state, action);
    localStorage.set(storageKey.WORKSPACE_SYNC, newState.toJS());
    return newState;
  }

  if (persistedState) {
    const newState = handler(fromJS(persistedState), action);
    localStorage.set(storageKey.WORKSPACE_SYNC, newState.toJS());
    return newState;
  }

  localStorage.set(storageKey.WORKSPACE_SYNC, initialState.toJS());
  return handler(initialState, action);
};
