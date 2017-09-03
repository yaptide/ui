/* @flow */

export type Material = {
  id: number,
  materialInfo: MaterialInfo,
  color: string,
}

export type MaterialInfo
  = PredefinedMaterial
  | CompoundMaterial
  | VoxelMaterial

export type MaterialType = 'predefined' | 'compound' | 'voxel';

export type PredefinedMaterial = {
  type: MaterialType,
  predefinedId: string,
  density?: number,
  stateOfMatter?: StateOfMatter,
  loadExternalStoppingPower?: bool,
}

export type CompoundMaterial = {
  type: MaterialType,
  name: string,
  density: number,
  stateOfMatter: StateOfMatter,
  elements: Array<CompoundElement>,
  externalStoppingPowerFromPrefedefined?: string,
}

export type CompoundElement = {
  isotope: string,
  relativeStochiometricFraction: number,
  atomicValue?: number,
  iValue?: number,
};
export type VoxelMaterial = {
  type: MaterialType,
}

export type StateOfMatter = 'solid' | 'gas' | 'liquid' | '';
