/* @flow */

import React from 'react';
import Style from 'styles';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import PlusIcon from 'material-ui/svg-icons/content/add';

import ZoneItemContainer from '../containers/ZoneItemContainer';

class ZoneWorkspaceLayout extends React.Component {
  props: {
    zoneIds: Array<number>,
    addZone: () => void,
    goToParentLayer: () => void,
  }

  render() {
    const goToParrentBtn = (
      <FlatButton
        onTouchTap={this.props.goToParentLayer}
        style={styles.goToParrentBtn}
        icon={<LeftArrowIcon />}
        disableTouchRipple
      />
    );

    const addZoneBtn = (
      <RaisedButton
        onTouchTap={this.props.addZone}
        style={styles.item}
        icon={<PlusIcon />}
      />
    );

    return (
      <div style={styles.wrapper} >
        <div style={styles.container}>
          {
            this.props.zoneIds.map(id => (
              <ZoneItemContainer key={id} zoneId={id} style={styles.item} />
            ))
          }
          {addZoneBtn}
        </div>
        {goToParrentBtn}
      </div>
    );
  }
}

const styles = {
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
  },
  item: {
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

};

export default ZoneWorkspaceLayout;
