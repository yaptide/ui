/* @flow */

import { Map, fromJS } from 'immutable';
import type { Material } from 'model/simulation/material';

export function createMaterial(
  state: Map<string, any>,
  material: Material,
): Map<string, any> {
  const materials = state.get('materials');
  const newMaterialId: number = 1 + materials.reduce((acc, val) => (val.get('id') > acc ? val.get('id') : acc), 0);
  const materialImmutable = fromJS({
    ...material,
    id: newMaterialId,
  });

  return state.setIn(['materials', String(newMaterialId)], materialImmutable);
}

export function updateMaterial(
  state: Map<string, any>,
  material: Material,
): Map<string, any> {
  const materialImmutable = fromJS(material);
  return state.setIn(['materials', String(material.id)], materialImmutable);
}

export function deleteMaterial(
  state: Map<string, any>,
  materialId: number,
): Map<string, any> {
  return state.deleteIn(['materials', String(materialId)]);
}

export default {
  create: createMaterial,
  update: updateMaterial,
  delete: deleteMaterial,
};
