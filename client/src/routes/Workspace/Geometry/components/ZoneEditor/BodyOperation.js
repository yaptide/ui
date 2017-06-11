/* @flow */

import React from 'react';
import Style from 'styles';
import RaisedButtonMD from 'material-ui/RaisedButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { ButtonHOC } from 'components/Touchable';
import OperationSelector from './OperationSelector';
import type { OperationType } from '../../../model';

const RaisedButton = ButtonHOC(RaisedButtonMD);

type Props = {
  id: number,
  body: { label: string },
  operation: OperationType,
  onBodySelected: (event: any, constructionStep: Object) => void,
  onOperationSelected: (constructionStep: number, value: OperationType) => void,
  createOperation: (constructionStep: number) => void,
  deleteOperation: (constructionStep: number) => void,
  style?: Object,
}

class BodyOperation extends React.Component {
  props: Props;

  createOperation = () => this.props.createOperation(this.props.id + 1);
  deleteOperation = () => this.props.deleteOperation(this.props.id);

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
          payload={{ construction: this.props.id }}
          style={{ ...this.props.style, ...styles.rowElement }}
        />
        <RaisedButton
          icon={<DeleteIcon />}
          onTouchTap={this.deleteOperation}
          style={{ ...this.props.style, ...styles.deleteButton }}
        />
        <div style={{ ...this.props.style, ...styles.addButtonPlaceholder }} />
        <RaisedButton
          icon={<AddIcon />}
          onTouchTap={this.createOperation}
          style={{ ...this.props.style, ...styles.addButton }}
        />
      </div>
    );
  }
}

const styles = {
  row: {
    ...Style.Flex.rootRow,
    position: 'relative',
  },
  rowElement: {
    flex: '1 0 0',
    marginRight: '0px',
    overflow: 'hidden',
  },
  addButton: {
    width: '50px',
    minWidth: '50px',
    marginRight: '0px',
    marginLeft: Style.Dimens.spacing.min,
    position: 'absolute',
    right: '0px',
    top: '20px',
  },
  addButtonPlaceholder: {
    width: '50px',
    minWidth: '50px',
    marginRight: '0px',
    marginLeft: Style.Dimens.spacing.min,
  },
  deleteButton: {
    width: '50px',
    minWidth: '50px',
    marginRight: '0px',
    marginLeft: Style.Dimens.spacing.min,
  },
};

export default BodyOperation;
