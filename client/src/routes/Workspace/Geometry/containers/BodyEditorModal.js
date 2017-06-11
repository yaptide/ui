/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'components/Modal';
import { Tab, Tabs } from 'material-ui/Tabs';
import Style from 'styles';
import BodyEditorContainer from './BodyEditorContainer';
import type { Body, BodyGeometry, ConstructionPath } from '../../model';
import selector from '../../selector';

type Props = {
  isModalOpen: ?bool,
  closeModal: () => void,
  constructionPath: ConstructionPath & { action: 'update' | 'create' },

  body: Body,
}

class BodyEditorModal extends React.Component {
  props: Props;
  state: {
    route: string,
    bodyGeometry: BodyGeometry | {},
  } = {
    route: 'create',
    bodyGeometry: {},
  };


  componentWillMount() {
    this.updateState(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.isModalOpen !== newProps.isModalOpen) {
      this.updateState(newProps);
    }
  }

  updateState = (props: Props) => {
    this.setState({
      bodyGeometry: (props.body.id !== undefined ? props.body.geometry : {
        type: undefined,
      }),
    });
  }

  onRouteChanged = (newRoute: string) => {
    this.setState({ route: newRoute });
  }

  setGeometry = (geometryUpdate: BodyGeometry) => {
    this.setState({ bodyGeometry: geometryUpdate });
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
          style={styles.tabsRoot}
          contentContainerStyle={styles.tabsContent}
        >
          <Tab label="Body creator" value="create" >
            <BodyEditorContainer
              bodyGeometry={this.state.bodyGeometry}
              setGeometry={this.setGeometry}
              constructionPath={this.props.constructionPath}
              bodyId={this.props.body.id}
              closeModal={this.props.closeModal}
            />
          </Tab>

          <Tab label="Select existing body" value="select" />
        </Tabs>
      </Modal>
    ) : null;
  }
}

const styles = {
  tabsRoot: {
    ...Style.Flex.rootColumn,
    height: '100%',
  },
  tabsContent: {
    flex: '1 0 0',
    ...Style.Flex.rootRow,
    alignContent: 'stretch',
  },
};

const mapStateToProps = (state, props) => {
  return {
    body: selector.bodyByConstructionPath(state, props.constructionPath).toJS(),
  };
};

export default connect(
  mapStateToProps,
)(BodyEditorModal);
