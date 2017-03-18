/* @flow */
// TODO FIX
/* eslint-disable */
import React from 'react';
import Style from 'styles';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

class ZoneItemLayout extends React.Component {
  render() {
    return (
      <Paper zDepth={2} style={styles.container} >
        <p>Main Zone</p>
        <DropDownMenu value={2} onChange={()=>null}>
          <MenuItem value={5} primaryText="Create new body" />
          <MenuItem value={1} primaryText="Body1" />
          <MenuItem value={2} primaryText="Body2" />
          <MenuItem value={3} primaryText="Body3" />
          <MenuItem value={4} primaryText="Body4" />
        </DropDownMenu>
        <div style={styles.opperation}>
          <DropDownMenu value={2} onChange={()=>null}>
            <MenuItem value={1} primaryText="-" />
            <MenuItem value={2} primaryText="+" />
            <MenuItem value={3} primaryText="U" />
          </DropDownMenu>

          <DropDownMenu value={2} onChange={()=>null} style={{ flex: '1 0 0' }} >
            <MenuItem value={5} primaryText="Create new body" />
            <MenuItem value={1} primaryText="Body1" />
            <MenuItem value={2} primaryText="Body2" />
            <MenuItem value={3} primaryText="Body3" />
            <MenuItem value={4} primaryText="Body4" />
          </DropDownMenu>

        </div>
      </Paper>
    );
  }
}

const styles = {
  container: {
    padding: Style.Dimens.spacing.small,
    ...Style.Flex.rootColumn,
    alignItems: 'stretch',
  },
  opperation: {
    ...Style.Flex.rootRow,
  },
};

export default ZoneItemLayout;
