/* @flow */

import { Map } from 'immutable';
import type { Color } from 'model/utils';

export function processMaterial(zone: Map<string, any>, materials: Map<string, any>) { //eslint-disable-line
  const materialId = zone.get('materialId');
  const colorRGBA: Color = materials.getIn([String(materialId), 'color'], Map()).toJS();
  if (
    colorRGBA.r !== undefined &&
    colorRGBA.g !== undefined &&
    colorRGBA.b !== undefined &&
    colorRGBA.a !== undefined
  ) {
    const { r, g, b } = colorRGBA;
    return `rgb(${r}, ${g}, ${b})`;
  }
  return '#000000';
}

export default processMaterial;
