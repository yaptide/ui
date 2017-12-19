/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import WorkspaceMaterialLayout from '../components/WorkspaceMaterialLayout';
import MaterialEditorModal from './MaterialEditorModal';
import selector from '../../selector';

type Props = {
  materialIds: Array<number>,
  classes?: Object,
};

type State = {
  isMaterialCreatorOpen: bool,
  editedMaterialId: ?number,
};

class WorkspaceMaterialContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    isMaterialCreatorOpen: false,
    editedMaterialId: undefined,
  }

  openCreatorModal = (materialId?: number) => {
    this.setState({ isMaterialCreatorOpen: true, editedMaterialId: materialId });
  }

  closeCreatorModal = () => {
    this.setState({ isMaterialCreatorOpen: false, editedMaterialId: undefined });
  }

  render() {
    return (
      <WorkspaceMaterialLayout
        openMaterialCreator={this.openCreatorModal}
        materials={this.props.materialIds}
        classes={this.props.classes}
      >
        <MaterialEditorModal
          isModalOpen={this.state.isMaterialCreatorOpen}
          materialId={this.state.editedMaterialId}
          closeModal={this.closeCreatorModal}
        />
      </WorkspaceMaterialLayout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    materialIds: selector.allMaterialIds(state),
  };
};

export default connect(
  mapStateToProps,
)(WorkspaceMaterialContainer);
