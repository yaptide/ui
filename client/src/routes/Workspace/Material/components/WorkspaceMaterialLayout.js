/* @flow */

import React from 'react';
import Button from 'material-ui/Button';
import IconAdd from 'material-ui-icons/Add';
import { withStyles } from 'material-ui/styles';
import MaterialItemContainer from '../containers/MaterialItemContainer';

type Props = {
  openMaterialCreator: (materialId: ?number) => void,
  materials: Array<number>,
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
        <Button
          onClick={this.openMaterialCreator}
          href="#/workspace/material"
          color="contrast"
          raised
        >
          <IconAdd />
        </Button>
        {materialItems}
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    margin: theme.spacing.unit * 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: '1 0 auto',
  },
  item: {
    marginTop: theme.spacing.unit * 2,
    '&:last-child': {
      marginBottom: theme.spacing.unit * 2,
    },
  },
});

export default withStyles(styles)(WorkspaceMaterialLayout);
