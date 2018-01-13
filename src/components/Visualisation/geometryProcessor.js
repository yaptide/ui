/* @flow */

import { Map } from 'immutable';
import { processZone } from './utils/zone';
import { processMaterial } from './utils/material';


export function processGeometry(workspaceData: Map<string, Map<string, any>>): Array<Object> {
  const zones = workspaceData.get('zones', Map());
  const bodies = workspaceData.get('bodies', Map());
  const materials = workspaceData.get('materials', Map());

  return zones
    .map((zoneData) => {
      const { zone, position } = processZone(zoneData, bodies);
      const color = processMaterial(zoneData, materials);
      return zone && color && zoneData && position
        ? { zone, color, zoneData, position }
        : undefined;
    })
    .toList()
    .filter(item => !!item)
    .toJS();
}
export default processGeometry;
