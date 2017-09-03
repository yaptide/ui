/* @flow */

import React from 'react';
import { connect } from 'react-redux';

type Props = {
  materialId?: number,
  closeModal: () => void,
}

class VoxelMaterialEditorContainer extends React.Component<Props> {
  props: Props

  render() {
    return (
      <div>
        VoxelMaterialEditorContainer
      </div>
    );
  }
}

const mapStateToProps = () => {
  return {

  };
};

export default connect(
  mapStateToProps,
)(VoxelMaterialEditorContainer);
