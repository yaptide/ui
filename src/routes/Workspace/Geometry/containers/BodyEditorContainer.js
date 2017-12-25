/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { t } from 'i18n';
import type { Body, BodyGeometry, ConstructionPath } from 'model/simulation/zone';
import type { GeometryType } from 'model/simulation/body';
import { validateBody } from 'utils/simulation/bodyValidator';
import BodyEditorLayout from '../components/BodyEditorLayout';
import { defaultBodyForType } from '../defaults';
import { actionCreator } from '../../reducer';

type Props = {
  bodyId: number,
  bodyGeometry: BodyGeometry,
  setGeometry: (geometry: BodyGeometry) => void,
  constructionPath: ConstructionPath & { action: 'update' | 'create' },
  closeModal: () => void,

  updateBody: (body: Body) => void,
  createBodyInZone: (body: Body, path: ConstructionPath) => void,
  classes?: Object,
};

type State = {
  geometryErrors: Object,
};

class BodyEditorContainer extends React.Component<Props, State> {
  props: Props
  state: State = {
    geometryErrors: {},
  }

  componentWillMount() {
    this.setState({
      geometryErrors: validateBody(
        { id: this.props.bodyId, geometry: this.props.bodyGeometry },
      ).geometry || {},
    });
  }

  componentWillReceiveProps(props: Props) {
    if (this.props.bodyGeometry !== props.bodyGeometry) {
      this.setState({
        geometryErrors: validateBody(
          { id: this.props.bodyId, geometry: props.bodyGeometry },
        ).geometry || {},
      });
    }
  }

  typeUpdate = (type: GeometryType) => {
    const newGeometry = { type, ...defaultBodyForType(type) };
    this.props.setGeometry(newGeometry);
  }

  geometryUpdate = (field: string, value: Object) => {
    const newGeometry: Object = { ...this.props.bodyGeometry, [field]: value };
    this.props.setGeometry((newGeometry: BodyGeometry));
  }

  applyChanges = () => {
    if (this.props.bodyId !== undefined) {
      const body: Body = { id: this.props.bodyId, geometry: this.props.bodyGeometry };
      this.props.updateBody(body);
    } else {
      const body: Body = { id: this.props.bodyId, geometry: this.props.bodyGeometry };
      this.props.createBodyInZone(body, this.props.constructionPath);
    }
    this.props.closeModal();
  }


  render() {
    return (
      <BodyEditorLayout
        bodyGeometry={this.props.bodyGeometry}
        bodyGeometryErrors={this.state.geometryErrors}
        typeUpdate={this.typeUpdate}
        geometryUpdate={this.geometryUpdate}
        submit={this.applyChanges}
        submitBtnName={
          this.props.bodyId !== undefined
            ? t('workspace.editor.updateBtn')
            : t('workspace.editor.createBtn')
        }
        classes={this.props.classes}
      />
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createBodyInZone: (body, path) => dispatch(actionCreator.createBodyInZone(body, path)),
    updateBody: body => dispatch(actionCreator.updateBody(body)),
  };
};

export default connect(
  undefined,
  mapDispatchToProps,
)(BodyEditorContainer);
