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

class ZoneWorkspaceLayout extends React.Component<Props> {
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
      >
        <PlusIcon />
      </Button>
    );

    return (
      <div className={classes.wrapper} >
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

const styles = () => ({
  wrapper: {
    height: '100%',
    marginTop: `-${Style.Dimens.spacing.normal}`,
    paddingTop: Style.Dimens.spacing.normal,
    paddingBottom: Style.Dimens.spacing.normal,
    paddingLeft: '46px',
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
    left: '16px',
    bottom: '0',
  },
});

export default withStyles(styles)(ZoneWorkspaceLayout);
