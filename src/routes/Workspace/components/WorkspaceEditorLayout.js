/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import VisualisationContainer from '../containers/VisualisationContainer';

type Props = {
  classes: Object,
  children: React$Element<*>,
};

class WorkspaceEditorLayout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <VisualisationContainer classes={{ root: classes.visualisation }} />
        {
          React.cloneElement(this.props.children, {
            classes: { root: classes.editor },
          })
        }
      </div>
    );
  }
}

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    margin: theme.spacing.unit * 2,
    overflow: 'hidden',
  },
  visualisation: {
    flex: '1 0 0',
    border: '2px solid',
    borderRadius: '4px',
    borderColor: theme.palette.grey[400],
    marginRight: theme.spacing.unit * 2,
  },
  editor: {
    width: theme.breakpoints.values.sm,
    position: 'relative',
    overflowY: 'auto',
  },
});

export default withStyles(styles)(WorkspaceEditorLayout);
