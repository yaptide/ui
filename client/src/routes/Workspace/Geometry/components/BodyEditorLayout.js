/* @flow */

import React from 'react';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
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
  classes: Object,
}

class BodyEditorLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <BodyEditor
          geometry={this.props.bodyGeometry}
          geometryErrors={this.props.bodyGeometryErrors}
          typeUpdate={this.props.typeUpdate}
          geometryUpdate={this.props.geometryUpdate}
          classes={{ root: classes.editor }}
        />
        <div style={styles.buttonRow}>
          <Button
            disabled={Object.keys(this.props.bodyGeometryErrors).length !== 0}
            onTouchTap={this.props.submit}
            color="primary"
            raised
          >
            {this.props.submitBtnName}
          </Button>
        </div>
      </div>
    );
  }
}

const styles = {
  root: {
    ...Style.Flex.rootColumn,
    flex: '1 0 0',
    height: '100%',
  },
  buttonRow: {
    ...Style.Flex.rootRow,
    justifyContent: 'flex-end',
  },
  editor: {
    flex: '1 0 0',
  },
};

export default withStyles(styles)(BodyEditorLayout);
