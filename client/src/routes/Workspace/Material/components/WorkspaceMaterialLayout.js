/* @flow */

import React from 'react';
import Button from 'material-ui/Button';
import IconAdd from 'material-ui-icons/Add';
import { withStyles } from 'material-ui/styles';
import MaterialItemContainer from '../containers/MaterialItemContainer';

type Props = {
  openMaterialCreator: (materialId: ?number) => void,
  materials: Array<number>,
  children?: React$Element<*>,
  classes: Object,
}

class WorkspaceMaterialLayout extends React.Component<Props> {
  props: Props

  openMaterialCreator = () => this.props.openMaterialCreator();

  render() {
    const { classes } = this.props;

    const materialItems = this.props.materials.map((id: number) => {
      return (
        <MaterialItemContainer
          key={id}
          materialId={id}
          classes={{ root: classes.item }}
        />
      );
    });
    return (
      <div className={classes.root}>
        {materialItems}
        {this.props.children}
        <Button
          onClick={this.openMaterialCreator}
          href="#/workspace/material"
          color="contrast"
          raised
          className={classes.item}
        >
          <IconAdd />
        </Button>
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    marginTop: theme.spacing.unit * 2,
    '&:first-child': {
      marginTop: 0,
    },
  },
});

export default withStyles(styles)(WorkspaceMaterialLayout);
