/* @flow */

import React from 'react';
import Style from 'styles';
import RaisedButtonMD from 'material-ui/RaisedButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { ButtonHOC } from 'components/Touchable';
import type { OperationType, ConstructionPath } from 'model/simulation/zone';
import OperationSelector from './OperationSelector';

const RaisedButton = ButtonHOC(RaisedButtonMD);

type Props = {
  id: number | "base",
  body: { label: string, bodyId: number },
  operation?: OperationType,
  onBodySelected: (constructionStep: ConstructionPath) => void,
  onOperationSelected: (constructionStep: ConstructionPath, operation: OperationType) => void,
  createOperation: (constructionStep: ConstructionPath) => void,
  deleteOperation?: (constructionStep: ConstructionPath) => void,
  internalMarginStyle?: Object,
}

const BASE_CONSTRUCTION_PATH = { base: true };
const OPERATION_CONSTRUCTION_PATH = (id: number) => ({ construction: id });

class ZoneOperation extends React.Component {
  props: Props;

  onBodySelected = (e: any, path: ConstructionPath) => this.props.onBodySelected(path);
  createOperation = () => this.props.createOperation(this.getConstructionPath());
  deleteOperation = () => (this.props.deleteOperation: any)(this.getConstructionPath());

  getConstructionPath = () => {
    return this.props.id === 'base'
      ? BASE_CONSTRUCTION_PATH
      : OPERATION_CONSTRUCTION_PATH(this.props.id);
  }

  render() {
    return (
      <div style={styles.row} >
        {
          this.props.operation
            ? <OperationSelector
              constructionPath={this.getConstructionPath()}
              operation={this.props.operation}
              onOperationSelected={this.props.onOperationSelected}
              style={this.props.internalMarginStyle}
            />
            : null
        }
        <RaisedButton
          label={this.props.body.label}
          onTouchTap={this.onBodySelected}
          payload={this.getConstructionPath()}
          style={{ ...this.props.internalMarginStyle, ...styles.rowElement }}
        />
        {
          this.props.deleteOperation
            ? <RaisedButton
              icon={<DeleteIcon />}
              onTouchTap={this.deleteOperation}
              style={{ ...this.props.internalMarginStyle, ...styles.deleteButton }}
            />
            : null
        }
        <div style={{ ...this.props.internalMarginStyle, ...styles.addButtonPlaceholder }} />
        <RaisedButton
          icon={<AddIcon />}
          onTouchTap={this.createOperation}
          style={{ ...this.props.internalMarginStyle, ...styles.addButton }}
        />
      </div>
    );
  }
}

const styles = {
  row: {
    ...Style.Flex.rootRow,
    alignItems: 'flex-start',
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

export default ZoneOperation;
