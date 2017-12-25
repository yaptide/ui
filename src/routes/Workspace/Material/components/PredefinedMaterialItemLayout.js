/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import type { PredefinedMaterial } from 'model/simulation/material';
import type { Color } from 'model/utils';
import Typorgaphy from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import red from 'material-ui/colors/red';
import selector from '../../selector';

type Props = {
  materialId: number,
  material: PredefinedMaterial,
  color: Color,
  materialLabel: string,
  editMaterial: () => void,
  deleteMaterial: () => void,
  classes: Object,
};

class PredefinedMaterialItemLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    const color = this.props.color;
    return (
      <div className={classes.root} >
        <div className={classes.infoWrap} >
          <Typorgaphy className={classes.name} >
            {`Predefined material: ${this.props.materialLabel}`}
          </Typorgaphy>
          <Paper className={classes.mainInfo}>
            <Typorgaphy className={classes.item} >
              {`Density [g/cm³]: ${this.props.material.density || 'default'}`}
            </Typorgaphy>
            <Typorgaphy className={classes.item} >
              {`State: ${this.props.material.stateOfMatter || 'default'}`}
            </Typorgaphy>
          </Paper>
        </div>
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
        <div
          className={classes.colorMarker}
          style={
            color
              ? { background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` }
              : null
          }
        />
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 4,
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colorMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: theme.spacing.unit * 2,
  },
  item: {
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
  infoWrap: {
    display: 'flex',
    flexDirection: 'row',
    flex: '1 1 0',
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
)(withStyles(styles)(PredefinedMaterialItemLayout));
