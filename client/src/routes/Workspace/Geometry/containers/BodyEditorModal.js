/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'components/Modal';
import { Tab, Tabs } from 'material-ui/Tabs';

type Props = {
  isModalOpen: ?bool,
  closeModal: () => void,
  // zoneId: number,
  // constructionStep: number | string,
}

class BodyEditorModal extends React.Component {
  props: Props;
  state: {
    route: string,
  } = {
    route: 'create',
  };

  onRouteChanged = (newRoute: string) => {
    this.setState({ route: newRoute });
  }

  render() {
    return this.props.isModalOpen ? (
      <Modal
        isOpen={this.props.isModalOpen}
        closeModal={this.props.closeModal}
        contentLabel="bodyEditor"
      >
        <Tabs
          value={this.state.route}
          onChange={this.onRouteChanged}
        >
          <Tab label="Body creator" value="create" />

          <Tab label="Select existing body" value="select" />
        </Tabs>
      </Modal>
    ) : null;
  }
}

const mapStateToProps = () => {
  return {
    bodyId: 1,
  };
};

export default connect(
  mapStateToProps,
)(BodyEditorModal);
