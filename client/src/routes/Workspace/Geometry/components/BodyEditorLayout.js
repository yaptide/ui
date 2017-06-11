/* @flow */

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Style from 'styles';
import type { BodyGeometry } from '../../model';
import type { GeometryType } from '../../bodyModel';
import BodyFormDescription from './BodyEditor/BodyFormDescription';

type Props = {
  bodyGeometry: BodyGeometry,
  typeUpdate: (type: GeometryType) => void,
  geometryUpdate: (field: string, value: Object) => void,
  submit: () => void,
  submitBtnName: string,
}

class BodyEditorLayout extends React.Component {
  props: Props

  render() {
    const GeometryForm = BodyFormDescription[this.props.bodyGeometry.type || 'empty'];
    if (!GeometryForm) {
      return null;
    }
    return (
      <div style={styles.editor}>
        <GeometryForm
          geometry={this.props.bodyGeometry}
          typeUpdate={this.props.typeUpdate}
          geometryUpdate={this.props.geometryUpdate}
          submit={this.props.submit}
        />
        <div style={styles.buttonRow}>
          <RaisedButton
            label={this.props.submitBtnName}
            onTouchTap={this.props.submit}
            primary
          />
        </div>
      </div>
    );
  }
}

const styles = {
  editor: {
    ...Style.Flex.rootColumn,
    height: '100%',
  },
  buttonRow: {
    ...Style.Flex.rootRow,
    justifyContent: 'flex-end',
  },
};

export default BodyEditorLayout;
