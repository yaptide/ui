/* @flow */

import React from 'react';
import Style from 'styles';
import ButtonMD from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import AddIcon from 'material-ui-icons/Add';
import DeleteIcon from 'material-ui-icons/Delete';
import { withStyles } from 'material-ui/styles';
import { ButtonHOC } from 'components/Touchable';
import type { OperationType, ConstructionPath } from 'model/simulation/zone';
import cn from 'classnames';
import OperationSelector from './OperationSelector';

const Button = ButtonHOC(ButtonMD);

type Props = {
  id: number | "base",
  body: { label: string, bodyId: number },
  operation?: OperationType,
  onBodySelected: (constructionStep: ConstructionPath) => void,
  onOperationSelected: (constructionStep: ConstructionPath, operation: OperationType) => void,
  createOperation: (constructionStep: ConstructionPath) => void,
  deleteOperation?: (constructionStep: ConstructionPath) => void,
  internalMarginStyle?: Object,
  classes: Object,
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
    const { classes } = this.props;
    return (
      <div className={classes.root} >
        {
          this.props.operation
            ? <OperationSelector
              constructionPath={this.getConstructionPath()}
              operation={this.props.operation}
              onOperationSelected={this.props.onOperationSelected}
              classes={{ root: classes.item }}
            />
            : null
        }
        <Button
          raised
          onTouchTap={this.onBodySelected}
          payload={this.getConstructionPath()}
          className={cn(classes.item, classes.bodySelector)}
        >
          <Typography noWrap className={classes.typographyBtn} >
            {this.props.body.label}
          </Typography>
        </Button>
        {
          this.props.deleteOperation
            ? <Button
              raised
              onTouchTap={this.deleteOperation}
              className={cn(classes.deleteButton, classes.item)}
              dense
            >
              <DeleteIcon />
            </Button>
            : null
        }
        <div className={classes.addButtonPlaceholder} />
        <Button
          raised
          onTouchTap={this.createOperation}
          className={classes.addButton}
          dense
        >
          <AddIcon />
        </Button>
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    ...Style.Flex.rootRow,
    alignItems: 'flex-start',
    position: 'relative',
  },
  item: {
    overflow: 'hidden',
  },
  bodySelector: {
    flex: '1 0 0',
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
    paddingTop: '9px',
    paddingBottom: '9px',
  },
  typographyBtn: {
    ...theme.typography.button,
    color: theme.palette.common.darkBlack,
  },
});

export default withStyles(styles)(ZoneOperation);
