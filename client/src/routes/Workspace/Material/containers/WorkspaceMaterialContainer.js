/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import WorkspaceLayout from 'pages/WorkspaceLayout';
import WorkspaceMaterialLayout from '../components/WorkspaceMaterialLayout';
import MaterialEditorModal from './MaterialEditorModal';
import selector from '../../selector';
import { actionCreator } from '../../reducer';

type Props = {
  isWorkspaceLoading: bool,
  fetchSimulationSetup: () => void,
  materialIds: Array<number>,
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

  componentWillMount() {
    this.props.fetchSimulationSetup();
  }

  openCreatorModal = (materialId?: number) => {
    this.setState({ isMaterialCreatorOpen: true, editedMaterialId: materialId });
  }

  closeCreatorModal = () => {
    this.setState({ isMaterialCreatorOpen: false, editedMaterialId: undefined });
  }

  render() {
    if (this.props.isWorkspaceLoading) {
      return <WorkspaceLayout activeWorkspaceTab="material" isWorkspaceLoading />;
    }
    return (
      <WorkspaceLayout
        activeWorkspaceTab="material"
        isWorkspaceLoading={this.props.isWorkspaceLoading}
      >
        <WorkspaceMaterialLayout
          openMaterialCreator={this.openCreatorModal}
          materials={this.props.materialIds}
        />
        <MaterialEditorModal
          isModalOpen={this.state.isMaterialCreatorOpen}
          materialId={this.state.editedMaterialId}
          closeModal={this.closeCreatorModal}
        />
      </WorkspaceLayout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isWorkspaceLoading: selector.isWorkspaceLoading(state),
    materialIds: selector.allMaterialIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSimulationSetup: () => dispatch(actionCreator.fetchSimulationSetup()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WorkspaceMaterialContainer);
