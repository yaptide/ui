/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { CompoundMaterial } from 'model/simulation/material';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import red from 'material-ui/colors/red';
import selector from '../../selector';

type Props = {
  materialId: number,
  material: CompoundMaterial,
  materialLabel: string,
  editMaterial: () => void,
  deleteMaterial: () => void,
  classes: Object,
};

class CompoundMaterialItemLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    const elementInfo = this.props.material.elements.map((element, index) => {
      return (
        <Paper className={classes.elementInfo} key={index} >
          <Typography className={classes.item} >
            {`Isotope: ${element.isotope}`}
          </Typography>
          <Typography className={classes.item} >
            {`Relative stochiometric fraction: ${element.relativeStochiometricFraction || 'error inavlid value'}`}
          </Typography>
          <Typography className={classes.item} >
            {`Atomic value: ${element.atomicValue || 'default'}`}
          </Typography>
          <Typography className={classes.item} >
            {`I-Value: ${element.iValue || 'default'}`}
          </Typography>
        </Paper>
      );
    });
    return (
      <div className={classes.root} >
        <div className={classes.infoWrap}>
          <div className={classes.info} >
            <Typography className={classes.name} >
              {`Compound material: ${this.props.material.name}`}
            </Typography>
            <Paper className={classes.mainInfo} >
              <Typography className={classes.mainItem} >
                {`Density [g/cm³]: ${this.props.material.density || 'default'}`}
              </Typography>
              <Typography className={classes.mainItem} >
                {`State: ${this.props.material.stateOfMatter || 'default'}`}
              </Typography>
            </Paper>
          </div>
          {elementInfo}
        </div>
        <div>
          <Button
            raised
            color="primary"
            onClick={this.props.editMaterial}
          >
            Edit
          </Button>
          <Button
            raised
            color="contrast"
            onClick={this.props.deleteMaterial}
            className={classes.deleteBtn}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    padding: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  mainItem: {
    paddingRight: theme.spacing.unit * 2,
  },
  name: {
    paddingRight: theme.spacing.unit * 2,
    padding: 4,
  },
  mainInfo: {
    display: 'flex',
    flexDirection: 'row',
    background: theme.palette.grey[700],
    padding: 4,
  },
  item: {
    flex: '1 1 0',
  },
  infoWrap: {
    flex: '1 0 auto',
  },
  elementInfo: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    background: theme.palette.grey[700],
    padding: 4,
    marginLeft: theme.spacing.unit * 2,
    margin: 4,
  },
  info: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  deleteBtn: {
    background: red[700],
    '&:hover': {
      background: red[900],
    },
  },
});

const mapStateToProps = (state, props) => {
  return {
    materialLabel: selector.materialByIdPrintable(state, props.materialId),
  };
};

export default connect(
  mapStateToProps,
)(withStyles(styles)(CompoundMaterialItemLayout));
