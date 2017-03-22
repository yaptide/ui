/* @flow */

import React from 'react';
import ZoneItemLayout from '../components/ZoneItemLayout';
import BodyEditorModal from './BodyEditorModal';
import type { OperationType } from '../../model';

type Props = {
  style?: Object,
}

class ZoneItemContainer extends React.Component {
  props: Props;
  state: {
    isBodyModalOpen: bool,
    zoneConstructionStep?: string | number,
  } = {
    isBodyModalOpen: false,
  }

  closeBodyModal = () => {
    this.setState({ isBodyModalOpen: false, zoneConstructionStep: undefined });
  }

  onBodySelected = (event: any, constructionStep: number | string) => {
    console.log('body selected', constructionStep);
    this.setState({ isBodyModalOpen: true, zoneConstructionStep: constructionStep });
  }

  onOperationSelected = (constructionStep: number, operation: OperationType) => {
    console.log(`Selected operation ${operation} in ${constructionStep} step`);
  }

  onMaterialSelected = () => {
    console.log('material');
  }

  render() {
    const material = { label: 'Water', materialId: 11 };

    const base = { label: 'Cube a: (1,2,1) b: (0,0,0)', bodyId: 13 };
    const construction = [
      { operation: 'subtract', body: { label: 'Sphere r: 1, c: (1,1,3)', bodyId: 10 } },
      {
        operation: 'union',
        body: { label: 'Cylinder s1: (0, 0, 0) s2: (1, 1, 1) r: 1', bodyId: 22 },
      },
    ];

    return (
      <div>
        <ZoneItemLayout
          style={this.props.style}
          material={material}
          base={base}
          construction={construction}
          onBodySelected={this.onBodySelected}
          onOperationSelected={this.onOperationSelected}
          onMaterialSelected={this.onMaterialSelected}
        />
        <BodyEditorModal
          isModalOpen={this.state.isBodyModalOpen}
          closeModal={this.closeBodyModal}
          zoneId={2}
          constructionStep={this.state.zoneConstructionStep}
        />
      </div>
    );
  }
}

export default ZoneItemContainer;
