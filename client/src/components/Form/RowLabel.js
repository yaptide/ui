/* @flow */

import React from 'react';
import Style from 'styles';
import { withStyles } from 'material-ui/styles';

type Props = {
  label: string,
  children?: Array<React$Element<*>> | React$Element<*>,
  classes: Object,
}

class RowLabel extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <div className={classes.label}>
          <div className={classes.labelText}>{`${this.props.label}:`}</div>
        </div>
        <div className={classes.inputs}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    ...Style.Flex.rootRow,
  },
  label: {
    ...Style.Flex.rootRow,
    flex: '1 0 0',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  inputs: {
    ...Style.Flex.rootRow,
    flex: '3 0 0',
  },
  labelText: {
    fontSize: 18,
    marginBottom: '12px',
    color: Style.Colors.white,
    marginLeft: Style.Dimens.spacing.small,
    paddingBottom: theme.spacing.unit,
  },
});

export default withStyles(styles)(RowLabel);
