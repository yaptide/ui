/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import type { OperationType, ConstructionPath, PrintableZone } from 'model/simulation/zone';
import type { PrintableMaterial } from 'model/simulation/material';
import ZoneItemLayout from '../components/ZoneItemLayout';
import BodyEditorModal from './BodyEditorModal';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  classes: Object,
  zoneId: number,
  zone: PrintableZone,
  materials: Array<PrintableMaterial>,
  changeOperationType: (val: OperationType, path: ConstructionPath) => void,
  removeOperation: (path: ConstructionPath) => void,
  createOperation: (path: ConstructionPath) => void,
  updateName: (name: string) => void,
  updateMaterial: (material: number) => void,

  goToChildLayer: (id: number) => void,
}

type State = {
  isBodyModalOpen: bool,
  zoneConstructionPath?: ConstructionPath,
};

class ZoneItemContainer extends React.Component<Props, State> {
  props: Props;
  state: State = {
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

  goToChildLayer = () => this.props.goToChildLayer(this.props.zoneId);

  render() {
    return (
      <div
        className={this.props.classes.root}
      >
        <ZoneItemLayout
          materialId={this.props.zone.materialId}
          materials={this.props.materials}
          base={this.props.zone.base}
          zoneName={this.props.zone.name}
          construction={this.props.zone.construction}
          onBodySelected={this.onBodySelected}
          onOperationSelected={this.onOperationSelected}
          onMaterialSelected={this.props.updateMaterial}
          onZoneNameUpdate={this.props.updateName}
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
    materials: selector.allSelectedMaterialsPrintable(state).toJS(),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    changeOperationType: (val, path) => dispatch(actionCreator.changeOperationType(val, path)),
    removeOperation: path => dispatch(actionCreator.deleteZoneOperation(path)),
    createOperation: path => dispatch(actionCreator.createZoneOperation(path)),
    updateName: value => dispatch(actionCreator.updateZoneField(props.zoneId, 'name', value)),
    updateMaterial: value => dispatch(actionCreator.updateZoneField(props.zoneId, 'materialId', Number(value))),
    goToChildLayer: id => dispatch(actionCreator.goToChildLayer(id)),
  };
};

const styles = {
  root: {},
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(ZoneItemContainer));
