/* @flow */

import React from 'react';
import Style from 'styles';

import FlatButton from 'material-ui/FlatButton';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import ZoneItemContainer from '../containers/ZoneItemContainer';

class ZoneWorkspaceLayout extends React.Component {
  props: {
    zoneIds: Array<number>
  }

  render() {
    const goToParrentBtn = (
      <FlatButton
        onTouchTap={() => console.log('ervger')}
        style={styles.goToParrentBtn}
        icon={<LeftArrowIcon />}
        disableTouchRipple
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
