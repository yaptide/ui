/* @flow */

import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Style from 'styles';
import type { BodyGeometry } from 'model/simulation/zone';
import type { GeometryType } from 'model/simulation/body';
import { BodyEditor } from 'components/Editor/BodyEditor';

type Props = {
  bodyGeometry: BodyGeometry,
  bodyGeometryErrors: Object,
  typeUpdate: (type: GeometryType) => void,
  geometryUpdate: (field: string, value: Object) => void,
  submit: () => void,
  submitBtnName: string,
}

class BodyEditorLayout extends React.Component {
  props: Props

  render() {
    return (
      <div style={styles.editor}>
        <BodyEditor
          geometry={this.props.bodyGeometry}
          geometryErrors={this.props.bodyGeometryErrors}
          typeUpdate={this.props.typeUpdate}
          geometryUpdate={this.props.geometryUpdate}
        />
        <div style={styles.buttonRow}>
          <RaisedButton
            disabled={Object.keys(this.props.bodyGeometryErrors).length !== 0}
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
