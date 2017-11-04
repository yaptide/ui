/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type {
  Material,
  PredefinedMaterial,
  StateOfMatter,
} from 'model/simulation/material';
import type { Color } from 'model/utils';
import * as _ from 'lodash';
import PredefinedMaterialEditorLayout from '../components/PredefinedMaterialEditorLayout';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  materialId?: number,
  material: Material,
  closeModal: () => void,
  materials: Array<{value: string, color: string, name: string}>,
  createMaterial: (material: Material) => void,
  updateMaterial: (material: Material) => void,
}

type State = {
  materialName: string,
  materialValue: string,
  density: number | '',
  materialState: StateOfMatter | '',
  color: Color,
  isMaterialSelected: bool,
}

class PredefinedMaterialEditorContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    materialName: '',
    materialValue: '',
    density: '',
    materialState: '',
    color: { r: 0x80, g: 0x80, b: 0x80, a: 0xFF },
    isMaterialSelected: false,
  }

  componentWillMount() {
    if (this.shouldLoadExistingMaterialData(this.props)) {
      this.updateMaterialState(this.props.material);
    }
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.shouldLoadExistingMaterialData(newProps)) {
      this.updateMaterialState(newProps.material);
    }
  }

  shouldLoadExistingMaterialData = (props: Props) => {
    return (
      props.material &&
      props.material.materialInfo &&
      props.material.materialInfo.type === 'predefined'
    );
  }

  updateMaterialState = (materialObj: any) => {
    const { materialInfo, color } : {
      materialInfo: PredefinedMaterial,
      color: Color,
    } = materialObj;

    this.setState({
      materialValue: materialInfo.predefinedId,
      materialName: _.reduce(
        this.props.materials,
        (acc, item) => (item.value === materialInfo.predefinedId ? item.name : acc),
        '',
      ),
      density: materialInfo.density || '',
      materialState: materialInfo.stateOfMatter || '',
      color,
      isMaterialSelected: !!materialObj.id,
    });
  }

  updateField = (value, type) => {
    this.setState({ [type]: value });
  }

  selectMaterial = (value: string) => {
    const predefinedMaterial = _.reduce(
      this.props.materials,
      (acc, item) => (item.value === value ? item : acc),
      {},
    );
    this.setState({
      isMaterialSelected: true,
      materialValue: value,
      materialName: predefinedMaterial.name,
      color: predefinedMaterial.color,
    });
  }

  removeMaterialSelection = () => {
    this.setState({
      isMaterialSelected: false,
      materialName: '',
      materialValue: '',
      density: '',
      materialState: '',
    });
  }

  submitForm = () => {
    const actionFunction = this.props.materialId
      ? this.props.updateMaterial
      : this.props.createMaterial;
    const materialId = this.props.materialId || 0;
    const materialInfo: PredefinedMaterial = {
      type: 'predefined',
      predefinedId: this.state.materialValue,
      density: this.state.density === '' ? undefined : Number(this.state.density),
      stateOfMatter: this.state.materialState === '' ? undefined : this.state.materialState,
    };

    actionFunction({
      id: materialId,
      color: this.state.color,
      materialInfo,
    });
    this.props.closeModal();
  }

  render() {
    return (
      <PredefinedMaterialEditorLayout
        new={this.props.materialId === undefined}
        materialName={this.state.materialName}
        density={this.state.density}
        materialState={this.state.materialState}
        isMaterialSelected={this.state.isMaterialSelected}
        color={this.state.color}
        options={this.props.materials}
        submit={this.submitForm}
        updateField={this.updateField}
        selectMaterial={this.selectMaterial}
        removeMaterialSelection={this.removeMaterialSelection}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    materials: selector.allPredefinedMaterialsPrintable(state).toJS(),
    material: selector.materialById(state, props.materialId).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createMaterial: material => dispatch(actionCreator.createMaterial(material)),
    updateMaterial: material => dispatch(actionCreator.updateMaterial(material)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PredefinedMaterialEditorContainer);
