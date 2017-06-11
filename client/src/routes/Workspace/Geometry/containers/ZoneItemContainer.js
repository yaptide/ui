/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import ZoneItemLayout from '../components/ZoneItemLayout';
import BodyEditorModal from './BodyEditorModal';
import type { OperationType, ConstructionPath } from '../../model';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  style?: Object,
  zoneId: number,
  zone: Object,
  changeOperationType: (val: OperationType, path: ConstructionPath) => void,
  removeOperation: (path: ConstructionPath) => void,
  createOperation: (path: ConstructionPath) => void,
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

  onBodySelected = (event: mixed, constructionPath: Object) => {
    this.setState({
      isBodyModalOpen: true,
      zoneConstructionPath: {
        ...constructionPath,
        zoneId: this.props.zoneId,
        action: 'update',
      },
    });
  }

  onOperationSelected = (constructionStep: number, operation: OperationType) => {
    this.props.changeOperationType(operation, {
      zoneId: this.props.zoneId,
      construction: constructionStep,
    });
  }

  onMaterialSelected = () => {
    console.log('material');
  }

  createOperation = (constructionStep: number) => {
    this.props.createOperation({
      zoneId: this.props.zoneId,
      construction: constructionStep,
    });
  }

  deleteOperation = (constructionStep: number) => {
    this.props.removeOperation({
      zoneId: this.props.zoneId,
      construction: constructionStep,
    });
  }

  render() {
    const material = { label: 'Water', materialId: 11 };

    return (
      <div>
        <ZoneItemLayout
          style={this.props.style}
          material={material}
          base={this.props.zone.base}
          construction={this.props.zone.construction}
          onBodySelected={this.onBodySelected}
          onOperationSelected={this.onOperationSelected}
          onMaterialSelected={this.onMaterialSelected}
          createOperation={this.createOperation}
          deleteOperation={this.deleteOperation}
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ZoneItemContainer);
