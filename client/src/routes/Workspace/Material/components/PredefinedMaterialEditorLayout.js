/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import type { StateOfMatter } from 'model/simulation/material';
import { FormInput, FormSelect, FuzzyChipSelector } from 'components/Form';

type Props = {
  new: bool,
  materialName: string,
  density: number | '',
  materialState: StateOfMatter | '',
  isMaterialSelected: bool,
  options: Array<{
    value: string,
    name: string,
    color: string,
  }>,
  submit: () => void,
  updateField: () => void,
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
