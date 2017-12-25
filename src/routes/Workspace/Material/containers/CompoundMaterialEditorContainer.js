/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type {
  Material,
  CompoundMaterial,
  CompoundElement,
  StateOfMatter,
} from 'model/simulation/material';
import type { Color } from 'model/utils';
import CompoundMaterialEditorLayout from '../components/CompoundMaterialEditorLayout';
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
  density: number | '',
  materialState: StateOfMatter | '',
  color: Color,
  compoundElements: Array<Object>,
  isMaterialSelected: bool,
}

class CompoundMaterialEditorContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    materialName: '',
    density: '',
    materialState: '',
    color: { r: 0x80, g: 0x80, b: 0x80, a: 0xFF },
    compoundElements: [],
    isMaterialSelected: false,
  }

  componentWillMount() {
    if (this.shouldLoadExistingMaterialData(this.props)) {
      this.updateMaterialState(this.props.material);
    }
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.shouldLoadExistingMaterialData(this.props)) {
      this.updateMaterialState(newProps.material);
    }
  }

  shouldLoadExistingMaterialData = (props: Props) => {
    return (
      props.material &&
      props.material.materialInfo &&
      props.material.materialInfo.type === 'compound'
    );
  }

  updateMaterialState = (materialObj: any) => {
    const { materialInfo, color } : {
      materialInfo: CompoundMaterial, color: Color,
    } = materialObj;
    this.setState({
      materialName: materialInfo.name,
      density: materialInfo.density || '',
      materialState: materialInfo.stateOfMatter || '',
      compoundElements: materialInfo.elements,
      color,
      isMaterialSelected: !!materialObj.id,
    });
  }

  updateField = (value, type) => {
    this.setState({ [type]: value });
  }

  addCompoundElement = () => {
    this.setState({
      compoundElements: [...this.state.compoundElements, this.emptyCompoundElement()],
    });
  }

  emptyCompoundElement = () => ({
    isotope: '', relativeStochiometricFraction: '', atomicValue: '', iValue: '',
  })

  deleteCompoundElement = (index: number) => {
    this.setState({
      compoundElements: [
        ...this.state.compoundElements.slice(0, index),
        ...this.state.compoundElements.slice(index + 1),
      ],
    });
  };

  updateCompoundElement = (index: number, element: CompoundElement) => {
    this.setState({
      compoundElements: [
        ...this.state.compoundElements.slice(0, index),
        { ...this.state.compoundElements[index], ...element },
        ...this.state.compoundElements.slice(index + 1),
      ],
    });
  };

  submitForm = () => {
    const actionFunction = this.props.materialId
      ? this.props.updateMaterial
      : this.props.createMaterial;
    const materialInfo: CompoundMaterial = {
      type: 'compound',
      name: this.state.materialName,
      density: Number(this.state.density),
      stateOfMatter: this.state.materialState,
      elements: this.state.compoundElements.map(element => ({
        ...element,
        relativeStochiometricFraction: Number(element.relativeStochiometricFraction),
        atomicValue: element.atomicValue === '' ? undefined : Number(element.atomicValue),
        iValue: element.iValue === '' ? undefined : Number(element.iValue),
      })),
      externalStoppingPowerFromPrefedefined: undefined,
    };
    actionFunction({
      id: this.props.materialId || 0,
      color: this.state.color,
      materialInfo,
    });
    this.props.closeModal();
  }

  render() {
    return (
      <CompoundMaterialEditorLayout
        new={this.props.materialId === undefined}
        materialName={this.state.materialName}
        density={this.state.density}
        materialState={this.state.materialState}
        color={this.state.color}
        compoundElements={this.state.compoundElements}
        updateField={this.updateField}
        addCompoundElement={this.addCompoundElement}
        updateCompoundElement={this.updateCompoundElement}
        deleteCompoundElement={this.deleteCompoundElement}
        submit={this.submitForm}
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
)(CompoundMaterialEditorContainer);
