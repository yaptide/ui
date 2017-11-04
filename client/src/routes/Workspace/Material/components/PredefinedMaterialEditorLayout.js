/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import type { StateOfMatter } from 'model/simulation/material';
import type { Color } from 'model/utils';
import { FormInput, FormSelect, FuzzyChipSelector } from 'components/Form';
import { ColorPicker } from 'components';

type Props = {
  new: bool,
  materialName: string,
  density: number | '',
  materialState: StateOfMatter | '',
  isMaterialSelected: bool,
  color: Color,
  options: Array<{
    value: string,
    name: string,
    color: string,
  }>,
  submit: () => void,
  updateField: (vaue: any, type: string) => void,
  selectMaterial: (value: string) => void,
  removeMaterialSelection: () => void,
  classes: Object,
}

const stateOfMatterOptions = [
  { field: '', label: '' },
  { field: 'liquid', label: 'liquid' },
  { field: 'gas', label: 'gas' },
  { field: 'solid', label: 'solid' },
];

class PredefinedMaterialEditorLayout extends React.Component<Props> {
  props: Props

  selectMaterial = (event: Object) => {
    this.props.selectMaterial(event.currentTarget.getAttribute('value'));
  }

  updateColor = (color: Color) => {
    this.props.updateField(color, 'color');
  }

  render() {
    const { classes, materialName, density, materialState } = this.props;
    return this.props.isMaterialSelected
      ? (
        <div className={classes.root}>
          <div className={classes.form} >
            <div className={classes.formFlex} >
              <div className={classes.materialRow} >
                <Typography type="subheading" >
                  {'Material: '}
                </Typography>
                <Chip
                  className={classes.largeChip}
                  label={materialName}
                  onRequestDelete={this.props.removeMaterialSelection}
                />
                <div className={classes.flex} />
                <ColorPicker
                  color={this.props.color}
                  updateColor={this.updateColor}
                />
              </div>
              <div className={classes.separator} />
              <FormInput
                type="density"
                label="Density [g/cm³] (optional)"
                numbersOnly
                value={density}
                onChange={this.props.updateField}
              />
              <FormSelect
                type="materialState"
                label="State of material (optional)"
                numbersOnly
                value={materialState}
                onChange={this.props.updateField}
                options={stateOfMatterOptions}
              />
            </div>
          </div>
          <div className={classes.submitBtnWrapper} >
            <Button
              raised
              color="primary"
              onClick={this.props.submit}
            >
              {this.props.new ? 'add' : 'update' }
            </Button>
          </div>
        </div>
      )
      : (
        <FuzzyChipSelector
          label="Materials"
          options={this.props.options}
          onItemSelected={this.props.selectMaterial}
          classes={{ root: classes.root }}
        />
      );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch',
    padding: theme.spacing.unit * 2,
  },
  flex: {
    flex: 1,
  },
  form: {
    flex: '1 1 auto',
    overflow: 'auto',
  },
  formFlex: {
    display: 'flex',
    flexDirection: 'column',
  },
  largeChip: {
    ...theme.typography.subheading,
    padding: theme.spacing.unit,
    marginLeft: theme.spacing.unit,
  },
  submitBtnWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: theme.spacing.unit,
  },
  materialRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: theme.spacing.unit,
  },
});

export default withStyles(styles)(PredefinedMaterialEditorLayout);
