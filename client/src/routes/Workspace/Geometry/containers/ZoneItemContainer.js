/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { OperationType, ConstructionPath, PrintableZone } from 'model/simulation/zone';
import ZoneItemLayout from '../components/ZoneItemLayout';
import BodyEditorModal from './BodyEditorModal';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  style?: Object,
  zoneId: number,
  zone: PrintableZone,
  changeOperationType: (val: OperationType, path: ConstructionPath) => void,
  removeOperation: (path: ConstructionPath) => void,
  createOperation: (path: ConstructionPath) => void,
  updateName: (id: number, name: string) => void,

  goToChildLayer: (id: number) => void,
}

class ZoneItemContainer extends React.Component {
  props: Props;
  state: {
    isBodyModalOpen: bool,
    zoneConstructionPath?: ConstructionPath,
  } = {
    isBodyModalOpen: false,
    zoneConstructionPath: undefined,
  }

  closeBodyModal = () => {
    this.setState({ isBodyModalOpen: false, zoneConstructionPath: undefined });
  }

  onBodySelected = (constructionPath: ConstructionPath) => {
    this.setState({
      isBodyModalOpen: true,
      zoneConstructionPath: {
        ...constructionPath,
        zoneId: this.props.zoneId,
      },
    });
  }

  onOperationSelected = (constructionStep: ConstructionPath, operation: OperationType) => {
    this.props.changeOperationType(operation, {
      zoneId: this.props.zoneId,
      construction: constructionStep.construction,
    });
  }

  onMaterialSelected = () => {
    console.log('material');
  }

  createOperation = (constructionStep: ConstructionPath) => {
    this.props.createOperation({
      zoneId: this.props.zoneId,
      construction: constructionStep.base ? 0 : constructionStep.construction + 1,
    });
  }

  deleteOperation = (constructionStep: ConstructionPath) => {
    this.props.removeOperation({
      zoneId: this.props.zoneId,
      construction: constructionStep.construction,
    });
  }

  onZoneNameUpdate = (name: string) => {
    this.props.updateName(this.props.zoneId, name);
  }

  goToChildLayer = () => this.props.goToChildLayer(this.props.zoneId);

  render() {
    const material = { label: 'Water', materialId: 11 };

    return (
      <div>
        <ZoneItemLayout
          style={this.props.style}
          material={material}
          base={this.props.zone.base}
          zoneName={this.props.zone.name}
          construction={this.props.zone.construction}
          onBodySelected={this.onBodySelected}
          onOperationSelected={this.onOperationSelected}
          onMaterialSelected={this.onMaterialSelected}
          onZoneNameUpdate={this.onZoneNameUpdate}
          createOperation={this.createOperation}
          deleteOperation={this.deleteOperation}
          goToChildLayer={this.goToChildLayer}
        />
        <BodyEditorModal
          isModalOpen={this.state.isBodyModalOpen}
          closeModal={this.closeBodyModal}
          constructionPath={this.state.zoneConstructionPath}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    zone: selector.zoneByIdPrintable(state, props.zoneId).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeOperationType: (val, path) => dispatch(actionCreator.changeOperationType(val, path)),
    removeOperation: path => dispatch(actionCreator.deleteZoneOperation(path)),
    createOperation: path => dispatch(actionCreator.createZoneOperation(path)),
    updateName: (id, value) => dispatch(actionCreator.updateZoneName(id, value)),
    goToChildLayer: id => dispatch(actionCreator.goToChildLayer(id)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ZoneItemContainer);
