/* @flow */

import React from 'react';

import type { BodyGeometry } from 'model/simulation/zone';
import type { GeometryType } from 'model/simulation/body';
import BodyFormDescription from './BodyFormDescription';

type Props = {
  geometry: BodyGeometry,
  geometryErrors: Object,
  typeUpdate: (type: GeometryType) => void,
  geometryUpdate: (field: string, value: Object) => void,
}

class BodyEditor extends React.Component {
  props: Props

  render() {
    const GeometryForm = BodyFormDescription[this.props.geometry.type || 'empty'];
    if (!GeometryForm) {
      return null;
    }
    return (
      <GeometryForm
        geometry={this.props.geometry}
        geometryErrors={this.props.geometryErrors}
        typeUpdate={this.props.typeUpdate}
        geometryUpdate={this.props.geometryUpdate}
      />
    );
  }
}

export default BodyEditor;
