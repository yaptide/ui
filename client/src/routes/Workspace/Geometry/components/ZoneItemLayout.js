/* @flow */
import React from 'react';
import Style from 'styles';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButtonMD from 'material-ui/RaisedButton';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import AddIcon from 'material-ui/svg-icons/content/add';
import { ButtonHOC } from 'components/Touchable';
import ZoneName from './ZoneEditor/ZoneName';
import BodyOperation from './ZoneEditor/BodyOperation';
import type { OperationType } from '../../model';

const RaisedButton = ButtonHOC(RaisedButtonMD);

type Props = {
  material: { label: string, materialId: number },
  base: { label: string },
  construction: Array<{type: OperationType, body: { label: string, bodyId: number }}>,
  onBodySelected: (event: any, constructionStep: Object) => void,
  onMaterialSelected: (event: any, constructionStep: number | string) => void,
  onOperationSelected: (constructionStep: number, operation: OperationType) => void,
  createOperation: (constructionStep: number) => void,
  deleteOperation: (constructionStep: number) => void,
  style?: Object,
};

class ZoneItemLayout extends React.Component {
  props: Props;
  state: {
    isOpen: bool,
  } = {
    isOpen: false,
  }

  toggleOpen = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  createOperationAfterBase = () => this.props.createOperation(0);

  render() {
    const zoneTitle = (
      <ZoneName name="Example zone name" isOpen={this.state.isOpen} toggleOpen={this.toggleOpen} />
    );
    const goToChildBtn = (
      <FlatButton
        onTouchTap={() => console.log('ervger')}
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
    const construction = this.props.construction.map((item, index) => (
      <BodyOperation
        id={index}
        key={index}
        body={item.body}
        operation={item.type}
        onBodySelected={this.props.onBodySelected}
        onOperationSelected={this.props.onOperationSelected}
        createOperation={this.props.createOperation}
        deleteOperation={this.props.deleteOperation}
        style={styles.constructionStyles}
      />
    ));

    return (
      <Paper zDepth={2} style={{ ...styles.container, ...this.props.style }} >
        {zoneTitle}
        <div style={styles.label} >Material</div>
        <RaisedButton
          label={this.props.material.label}
          onTouchTap={this.props.onMaterialSelected}
          payload={this.props.material.materialId}
          fullWidth
        />
        <div style={styles.label} >Construction</div>
        <div style={styles.row}>
          <RaisedButton
            label={this.props.base.label}
            onTouchTap={this.props.onBodySelected}
            payload={{ baseId: true }}
            style={styles.firstBody}
          />
          <div style={styles.addButtonPlaceholder} />
          <RaisedButton
            icon={<AddIcon />}
            onTouchTap={this.createOperationAfterBase}
            style={styles.addButton}
          />
        </div>
        {construction}
        <div style={{ 'paddingBottom': Style.Dimens.spacing.large }} />
        {goToChildBtn}
      </Paper>
    );
  }
}

const styles = {
  container: {
    padding: Style.Dimens.spacing.small,
    marginLeft: Style.Dimens.spacing.small,
    marginRight: Style.Dimens.spacing.small,
    ...Style.Flex.rootColumn,
    alignItems: 'stretch',
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
