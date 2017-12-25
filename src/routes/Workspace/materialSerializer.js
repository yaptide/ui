/* @flow */

import { Map } from 'immutable';
import type {
  PredefinedMaterial,
  CompoundMaterial,
} from 'model/simulation/material';

const mapSerializers = {
  predefined: serializePredefined,
  compound: serializeCompound,
  voxel: () => 'voxel not implemented',
};

function serializePredefined(
  material: PredefinedMaterial, configuration: Map<string, any>,
) {
  const materialName = configuration.getIn(['predefinedMaterials', material.predefinedId, 'name'], '----');
  const density = material.density ? `density: ${material.density}g/cm³` : '';
  const stateOfMatter = material.stateOfMatter ? material.stateOfMatter : '';
  let restNames = '';
  if (density && stateOfMatter) {
    restNames = ` [${density}, ${stateOfMatter}]`;
  } else if (density) {
    restNames = ` [${density}]`;
  } else if (stateOfMatter) {
    restNames = ` [${stateOfMatter}]`;
  }
  return `${materialName}${restNames}`;
}

function serializeCompound(
  material: CompoundMaterial, configuration: Map<string, any>,
) {
  const density = material.density ? `density: ${material.density}g/cm³` : '';
  const stateOfMatter = material.stateOfMatter ? material.stateOfMatter : '';
  const restNames = ` [${density}, ${stateOfMatter}]`;
  const isotopes = material.elements.map((isotope) => {
    return configuration.getIn(['isotopes', isotope.isotope, 'name'], '-');
  }).join(', ');
  return `${material.name}${restNames}[${isotopes}]`;
}

function serializeMaterial(material: any, configuration: Map<string, any>) {
  if (!material || !material.materialInfo || !material.materialInfo.type) return '----';
  const serializer = mapSerializers[material.materialInfo.type];
  const label = serializer
    ? serializer(material.materialInfo, configuration)
    : '----';
  return label;
}

export default serializeMaterial;
