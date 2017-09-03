/* @flow */
import React from 'react';
import Style from 'styles';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import RightArrowIcon from 'material-ui-icons/KeyboardArrowRight';
import { withStyles } from 'material-ui/styles';
import { ZoneName, ZoneEditor } from 'components/Editor/ZoneEditor';
import type { OperationType, ConstructionPath, PrintableOperation } from 'model/simulation/zone';

type Props = {
  zoneName: string,
  material: { label: string, materialId: number },
  base: { label: string, bodyId: number },
  construction: Array<PrintableOperation>,
  onBodySelected: (constructionStep: Object) => void,
  onMaterialSelected: (materialId: number) => void,
  onOperationSelected: (constructionStep: ConstructionPath, operation: OperationType) => void,
  onZoneNameUpdate: (name: string) => void,
  createOperation: (constructionStep: ConstructionPath) => void,
  deleteOperation: (constructionStep: ConstructionPath) => void,

  classes: Object,
  goToChildLayer: () => void,
};

type State = {
  isOpen: bool,
};

class ZoneItemLayout extends React.Component<Props, State> {
  props: Props;
  state: State = {
    isOpen: true,
  }

  toggleOpen = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    const { classes, zoneName, base, construction, material } = this.props;
    const zoneTitle = (
      <ZoneName
        name={zoneName}
        isOpen={this.state.isOpen}
        toggleOpen={this.toggleOpen}
        updateName={this.props.onZoneNameUpdate}
      />
    );
    const goToChildBtn = (
      <Button
        onTouchTap={this.props.goToChildLayer}
        className={classes.goToChildrenBtn}
        dense
      >
        <RightArrowIcon />
      </Button>
    );
    if (!this.state.isOpen) {
      return (
        <Paper zDepth={2} className={classes.container} >
          {zoneTitle}
          {goToChildBtn}
        </Paper>
      );
    }

    return (
      <Paper elevation={4} className={classes.container} >
        <ZoneEditor
          zoneName={zoneName}
          material={material}
          base={base}
          construction={construction}
          onBodySelected={this.props.onBodySelected}
          onMaterialSelected={this.props.onMaterialSelected}
          onOperationSelected={this.props.onOperationSelected}
          onZoneNameUpdate={this.props.onZoneNameUpdate}
          createOperation={this.props.createOperation}
          deleteOperation={this.props.deleteOperation}
        />
        {goToChildBtn}
      </Paper>
    );
  }
}

const styles = (theme: Object) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit,
    position: 'relative',
    paddingRight: theme.spacing.unit * 4,
    minHeight: '48px',
    overflow: 'hidden',
  },
  opperation: {
    ...Style.Flex.rootRow,
  },
  constructionStyles: {
    marginTop: Style.Dimens.spacing.min,
    marginBottom: Style.Dimens.spacing.min,
    marginRight: Style.Dimens.spacing.min,
  },
  label: {
    marginTop: Style.Dimens.spacing.small,
  },
  goToChildrenBtn: {
    borderLeft: `1px solid ${Style.Colors.gray}`,
    width: '30px',
    minWidth: '30px',
    height: '100%',
    lineHeight: '100%',
    position: 'absolute',
    top: '0',
    right: '0',
    bottom: '0',
  },
  row: {
    ...Style.Flex.rootRow,
    position: 'relative',
  },
  addButton: {
    marginTop: Style.Dimens.spacing.min,
    marginBottom: Style.Dimens.spacing.min,
    marginLeft: Style.Dimens.spacing.min,
    width: '50px',
    minWidth: '50px',
    position: 'absolute',
    right: '0px',
    top: '20px',
  },
  addButtonPlaceholder: {
    marginTop: Style.Dimens.spacing.min,
    marginBottom: Style.Dimens.spacing.min,
    marginLeft: Style.Dimens.spacing.min,
    width: '50px',
    minWidth: '50px',
    marginRight: '0px',
  },
  firstBody: {
    flex: '1 0 0',
    marginTop: Style.Dimens.spacing.min,
    marginBottom: Style.Dimens.spacing.min,
    overflow: 'hidden',
  },
});

export default withStyles(styles)(ZoneItemLayout);
