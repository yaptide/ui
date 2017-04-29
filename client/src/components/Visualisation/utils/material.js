/* @flow */

import { Map } from 'immutable';

export function processMaterial(zone: Map<string, any>, materials: Map<string, any>) { //eslint-disable-line
  const mockColorMapping = {
    '1': {
      name: 'material1',
      color: '#0000FF',
    },
    '2': {
      name: 'material2',
      color: '#00FF00',
    },
    '3': {
      name: 'material3',
      color: '#FF0000',
    },
  };
  return (mockColorMapping[zone.get('materialId')] || {}).color;
}

export default processMaterial;
