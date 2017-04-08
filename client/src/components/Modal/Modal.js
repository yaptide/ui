/* @flow */

import React from 'react';
import RNModal from 'react-modal';
import Style from 'styles';

class Modal extends React.Component {
  props: {
    contentLabel: string,
    isOpen: ?bool,
    closeModal: () => void,
    children?: any,
  }

  render() {
    return (
      <RNModal
        contentLabel={this.props.contentLabel}
        isOpen={this.props.isOpen}
        onRequestClose={this.props.closeModal}
        style={{ overlay: styles.overlay, content: styles.content }}
      >
        {
          this.props.isOpen
            ? this.props.children
            : null
        }
      </RNModal>
    );
  }
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Style.Theme.palette.disabledColor,
    zIndex: 2100,
  },
  content: {
    position: 'absolute',
    top: '60px',
    left: '60px',
    right: '60px',
    bottom: '60px',
    border: '1px solid #ccc',
    background: Style.Theme.palette.canvasColor,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    paddin: '20px',
  },
};

export default Modal;
