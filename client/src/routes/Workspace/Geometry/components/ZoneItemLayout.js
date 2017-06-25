/* @flow */
import React from 'react';
import Style from 'styles';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
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
  style?: Object,

  goToChildLayer: () => void,
};

class ZoneItemLayout extends React.Component {
  props: Props;
  state: {
    isOpen: bool,
  } = {
    isOpen: true,
  }

  toggleOpen = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    const zoneTitle = (
      <ZoneName
        name={this.props.zoneName}
        isOpen={this.state.isOpen}
        toggleOpen={this.toggleOpen}
        updateName={this.props.onZoneNameUpdate}
      />
    );
    const goToChildBtn = (
      <FlatButton
        onTouchTap={this.props.goToChildLayer}
        style={styles.goToChildrenBtn}
        icon={<RightArrowIcon />}
        disableTouchRipple
      />
    );
    if (!this.state.isOpen) {
      return (
        <Paper zDepth={2} style={{ ...styles.container, ...this.props.style }} >
          {zoneTitle}
          {goToChildBtn}
        </Paper>
      );
    }

    return (
      <Paper zDepth={2} style={{ ...styles.container, ...this.props.style }} >
        <ZoneEditor
          zoneName={this.props.zoneName}
          material={this.props.material}
          base={this.props.base}
          construction={this.props.construction}
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

const styles = {
  container: {
    padding: Style.Dimens.spacing.small,
    position: 'relative',
    paddingRight: '30px',
    minHeight: '48px',
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
};

export default ZoneItemLayout;
