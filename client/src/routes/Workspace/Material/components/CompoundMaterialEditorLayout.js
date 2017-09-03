/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import IconAdd from 'material-ui-icons/Add';
import Typography from 'material-ui/Typography';
import type { StateOfMatter, CompoundElement } from 'model/simulation/material';
import { FormInput, FormSelect } from 'components/Form';
import CompoundElementItemEditor from './CompoundElementItemEditor';

type Props = {
  new: bool,
  materialName: string,
  density: number | '',
  materialState: StateOfMatter | '',
  compoundElements: Array<CompoundElement>,
  submit: () => void,
  updateField: () => void,
  addCompoundElement: () => void,
  deleteCompoundElement: (index: number) => void,
  updateCompoundElement: (index: number, element: CompoundElement) => void,
  classes: Object,
}

const stateOfMatterOptions = [
  { field: '', label: '' },
  { field: 'liquid', label: 'liquid' },
  { field: 'gas', label: 'gas' },
  { field: 'solid', label: 'solid' },
];

class CompoundMaterialEditorLayout extends React.Component<Props> {
  props: Props

  render() {
    const { classes, materialName, density, materialState, compoundElements } = this.props;
    const compoundElementComponents = compoundElements.map((element, index) => {
      return (
        <CompoundElementItemEditor
          key={index}
          index={index}
          element={element}
          addCompoundElement={this.props.addCompoundElement}
          updateCompoundElement={this.props.updateCompoundElement}
          deleteCompoundElement={this.props.deleteCompoundElement}
        />
      );
    });
    return (
      <div className={classes.root}>
        <div className={classes.form}>
          <div className={classes.formFlex}>
            <FormInput
              type="materialName"
              label="Name"
              value={materialName}
              onChange={this.props.updateField}
              fullWidth
            />
            <div className={classes.separator} />
            <FormInput
              type="density"
              label="Density [g/cm³]"
              numbersOnly
              value={density}
              onChange={this.props.updateField}
            />
            <FormSelect
              type="materialState"
              label="State of material"
              numbersOnly
              value={materialState}
              onChange={this.props.updateField}
              options={stateOfMatterOptions}
            />
            <div className={classes.separator} />
            <div className={classes.separator} />
            <Typography type="subheading" className={classes.subtitle}>Compond elements:</Typography>
            {compoundElementComponents}
            <Button
              raised
              color="contrast"
              onClick={this.props.addCompoundElement}
            >
              <IconAdd />
            </Button>
            <div className={classes.separator} />
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
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    alignItems: 'stretch',
    padding: theme.spacing.unit * 2,
  },
  form: {
    flex: '1 1 auto',
    overflow: 'auto',
    paddingRight: theme.spacing.unit,
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
  subtitle: {
    fontSize: 18,
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

export default withStyles(styles)(CompoundMaterialEditorLayout);
