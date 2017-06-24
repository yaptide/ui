/* @flow */

import React from 'react';
import Style from 'styles';
import RaisedButtonMD from 'material-ui/RaisedButton';
import { ButtonHOC } from 'components/Touchable';
import { ZoneName, ZoneOperation } from 'components/Editor/ZoneEditor';
import type { OperationType, ConstructionPath, PrintableOperation } from 'model/simulation/zone';

const RaisedButton = ButtonHOC(RaisedButtonMD);

type Props = {
  zoneName: string,
  material: { label: string, materialId: number },
  base: { label: string, bodyId: number },
  construction: Array<PrintableOperation>,
  onBodySelected: (constructionStep: ConstructionPath) => void,
  onMaterialSelected: (materialId: number) => void,
  onOperationSelected: (constructionStep: ConstructionPath, operation: OperationType) => void,
  onZoneNameUpdate: (name: string) => void,
  createOperation: (constructionStep: ConstructionPath) => void,
  deleteOperation: (constructionStep: ConstructionPath) => void,
  style?: Object,
};


class ZoneEditor extends React.Component {
  props: Props;

  render() {
    const zoneTitle = (
      <ZoneName
        name={this.props.zoneName}
        updateName={this.props.onZoneNameUpdate}
      />
    );
    const construction = this.props.construction.map((item: PrintableOperation, index:number) => (
      <ZoneOperation
        id={index}
        key={index}
        body={item.body}
        operation={item.type}
        onBodySelected={this.props.onBodySelected}
        onOperationSelected={this.props.onOperationSelected}
        createOperation={this.props.createOperation}
        deleteOperation={this.props.deleteOperation}
        internalMarginStyle={styles.constructionStyles}
      />
    ));

    return (
      <div style={{ ...styles.container, ...this.props.style }} >
        {zoneTitle}
        <div style={styles.label} >Material</div>
        <RaisedButton
          label={this.props.material.label}
          onTouchTap={this.props.onMaterialSelected}
          payload={this.props.material.materialId}
        />
        <div style={styles.label} >Construction</div>
        <ZoneOperation
          id="base"
          key="base"
          body={this.props.base}
          onBodySelected={this.props.onBodySelected}
          onOperationSelected={this.props.onOperationSelected}
          createOperation={this.props.createOperation}
          internalMarginStyle={styles.constructionStyles}
        />
        {construction}
        <div style={{ 'paddingBottom': Style.Dimens.spacing.large }} />
      </div>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.rootColumn,
    alignContent: 'stretch',
    padding: Style.Dimens.spacing.small,
    position: 'relative',
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

export default ZoneEditor;
