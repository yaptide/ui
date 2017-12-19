/* @flow */

import React from 'react';
import Style from 'styles';

import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import PlusIcon from 'material-ui-icons/Add';

import ZoneItemContainer from '../containers/ZoneItemContainer';

type Props = {
  zoneIds: Array<number>,
  addZone: () => void,
  goToParentLayer: () => void,
  classes: Object,
}

class WorkspaceGeometryLayout extends React.Component<Props> {
  props: Props

  render() {
    const { zoneIds, classes } = this.props;
    const goToParrentBtn = (
      <Button
        onTouchTap={this.props.goToParentLayer}
        className={classes.goToParrentBtn}
        dense
      >
        <KeyboardArrowLeft />
      </Button>
    );

    const addZoneBtn = (
      <Button
        onTouchTap={this.props.addZone}
        className={classes.item}
        raised
        color="contrast"
        dense
      >
        <PlusIcon />
      </Button>
    );

    return (
      <div className={classes.root} >
        <div className={classes.container}>
          {
            zoneIds.map(id => (
              <ZoneItemContainer
                key={id}
                zoneId={id}
                classes={{ root: classes.item }}
              />
            ))
          }
          {addZoneBtn}
        </div>
        {goToParrentBtn}
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    paddingLeft: '30px',
  },
  container: {
    height: '100%',
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    flex: '0 0 auto',
    marginBottom: Style.Dimens.spacing.normal,
    marginLeft: Style.Dimens.spacing.small,
    marginRight: Style.Dimens.spacing.small,
    ...Style.Flex.rootColumn,
    alignItems: 'stretch',
  },
  goToParrentBtn: {
    width: '30px',
    minWidth: '30px',
    height: '100%',
    lineHeight: '100%',
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
    background: theme.palette.background.paper,
  },
});

export default withStyles(styles)(WorkspaceGeometryLayout);
