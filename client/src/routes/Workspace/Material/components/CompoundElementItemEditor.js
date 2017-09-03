/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import type { CompoundElement } from 'model/simulation/material';
import { FormInput, FuzzyChipSelector } from 'components/Form';
import selector from '../../selector';

type Props = {
  index: number,
  element: CompoundElement,
  deleteCompoundElement: (index: number) => void,
  updateCompoundElement: (index: number, element: Object) => void,
  isotopes: Array<{value: string, name: string}>,
  classes: Object,
}

class CompoundElementItemEditor extends React.Component<Props> {
  props: Props

  selectIsotope = (selected: string) => {
    this.props.updateCompoundElement(this.props.index, { isotope: selected });
  }

  deleteCompoundElement = () => {
    this.props.deleteCompoundElement(this.props.index);
  }

  updateField = (value: string, type: string) => {
    this.props.updateCompoundElement(this.props.index, { [type]: value });
  }

  render() {
    const { classes, element } = this.props;
    return (
      <Paper className={classes.paper} >
        {
          element.isotope ? (
            <div className={classes.root}>
              <div className={classes.materialRow} >
                <Typography type="subheading" >
                  {'Material: '}
                </Typography>
                <Chip
                  label={element.isotope}
                  onRequestDelete={this.deleteCompoundElement}
                />
              </div>
              <FormInput
                type="relativeStochiometricFraction"
                label="Relatve stochiometric fraction"
                onChange={this.updateField}
                value={element.relativeStochiometricFraction}
                classes={{ root: classes.item }}
                numbersOnly
              />
              <FormInput
                type="atomicValue"
                label="Atomic value (optional)"
                onChange={this.updateField}
                value={element.atomicValue}
                classes={{ root: classes.item }}
                numbersOnly
              />
              <FormInput
                type="iValue"
                label="I-value (optional)"
                onChange={this.updateField}
                value={element.iValue}
                classes={{ root: classes.item }}
                numbersOnly
              />
            </div>
          ) : (
            <FuzzyChipSelector
              label="Isotope: "
              options={this.props.isotopes}
              onItemSelected={this.selectIsotope}
              classes={{ root: classes.fuzzySelector }}
            />
          )
        }
      </Paper>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignContent: 'flex-start',
  },
  materialRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: '1 0 auto',
    paddingRight: theme.spacing.unit * 2,
  },
  item: {
    flex: '1 0 auto',
    paddingRight: theme.spacing.unit * 2,
    minWidth: 0,
    '&:last-child': {
      paddingRight: 0,
    },
  },
  fuzzySelector: {
    minHeight: '200px',
  },
  paper: {
    padding: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
    background: theme.palette.grey[700],
  },
});

const mapStateToProps = (state) => {
  return {
    isotopes: selector.allIsotopesPrintable(state).toJS(),
  };
};

export default connect(
  mapStateToProps,
)(withStyles(styles)(CompoundElementItemEditor));
