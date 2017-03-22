/* @flow */

import React from 'react';
import Style from 'styles';
import RaisedButtonMD from 'material-ui/RaisedButton';
import { ButtonHOC } from 'components/Touchable';
import OperationSelector from './OperationSelector';
import type { OperationType } from '../../../model';

const RaisedButton = ButtonHOC(RaisedButtonMD);

type Props = {
  id: number,
  body: { label: string },
  operation: OperationType,
  onBodySelected: (event: any, constructionStep: string | number) => void,
  onOperationSelected: (constructionStep: number, value: OperationType) => void,
  style?: Object,
}

class BodyOperation extends React.Component {
  props: Props;

  render() {
    return (
      <div style={styles.row} >
        <OperationSelector
          id={this.props.id}
          operation={this.props.operation}
          onOperationSelected={this.props.onOperationSelected}
          style={this.props.style}
        />
        <RaisedButton
          label={this.props.body.label}
          onTouchTap={this.props.onBodySelected}
          payload={this.props.id}
          style={{ ...this.props.style, ...styles.rowElement }}
        />
      </div>
    );
  }
}

const styles = {
  row: {
    ...Style.Flex.rootRow,
  },
  rowElement: {
    flex: '1 0 0',
    marginRight: '0px',
  },
};

export default BodyOperation;
