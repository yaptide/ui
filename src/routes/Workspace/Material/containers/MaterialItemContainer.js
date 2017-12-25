/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { Material } from 'model/simulation/material';
import selector from '../../selector';
import PredefinedMaterialItemLayout from '../components/PredefinedMaterialItemLayout';
import CompoundMaterialItemLayout from '../components/CompoundMaterialItemLayout';
import MaterialItemLayout from '../components/MaterialItemLayout';
import MaterialEditorModal from './MaterialEditorModal';
import { actionCreator } from '../../reducer';

type Props = {
  materialId: number,
  material: Material,
  deleteMaterial: () => void,
  classes?: Object,
}

type State = {
  isMaterialCreatorOpen: bool,
  editedMaterialId: ?number,
};

class MaterialItemContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    isMaterialCreatorOpen: false,
    editedMaterialId: undefined,
  }

  openEditorModal = () => {
    this.setState({ isMaterialCreatorOpen: true, editedMaterialId: this.props.materialId });
  }

  closeEditorModal = () => {
    this.setState({ isMaterialCreatorOpen: false, editedMaterialId: undefined });
  }

  render() {
    const classes = this.props.classes;
    return (
      <MaterialItemLayout classes={{ root: classes && classes.root }} >
        {
          this.props.material.materialInfo.type === 'predefined' ?
            <PredefinedMaterialItemLayout
              materialId={this.props.materialId}
              material={this.props.material.materialInfo}
              color={this.props.material.color}
              editMaterial={this.openEditorModal}
              deleteMaterial={this.props.deleteMaterial}
            /> : null
        }
        {
          this.props.material.materialInfo.type === 'compound' ?
            <CompoundMaterialItemLayout
              materialId={this.props.materialId}
              material={this.props.material.materialInfo}
              color={this.props.material.color}
              editMaterial={this.openEditorModal}
              deleteMaterial={this.props.deleteMaterial}
            /> : null
        }

        <MaterialEditorModal
          isModalOpen={this.state.isMaterialCreatorOpen}
          materialId={this.state.editedMaterialId}
          closeModal={this.closeEditorModal}
        />
      </MaterialItemLayout>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    material: selector.materialById(state, props.materialId).toJS(),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    deleteMaterial: () => dispatch(actionCreator.deleteMaterial(props.materialId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MaterialItemContainer);
