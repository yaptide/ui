/* @flow */

import React from 'react';
import Style from 'styles';
import { t } from 'i18n';
import router from 'utils/router';
import { CircularProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import AppLayout from './AppLayout';

const link = {
  geometry: () => router.push('/workspace/geometry'),
  material: () => router.push('/workspace/material'),
  beam: () => router.push('/workspace/beam'),
  detectors: () => router.push('/workspace/detectors'),
  settings: () => router.push('/workspace/settings'),
};

type Props = {
  activeWorkspaceTab?: string,
  isWorkspaceLoading?: bool,
  children?: React.Component<*, *, *>,
  classes: Object,
}

class WorkspaceLayout extends React.Component<Props> {
  props: Props;

  isActive = (tab: string) => {
    return this.props.activeWorkspaceTab === tab ? 'accent' : undefined;
  }

  render() {
    const { children, activeWorkspaceTab, isWorkspaceLoading, classes, ...props } = this.props;
    return (
      <AppLayout {...props} >
        <Toolbar className={classes.toolbar} >
          <Typography className={classes.toolbarTitle} >Workspace</Typography>
          <Button
            style={styles.button}
            color={this.isActive('settings')}
            onTouchTap={link.settings}
          >
            {t('tabSettings')}
          </Button>
          <Button
            style={styles.button}
            color={this.isActive('geometry')}
            onTouchTap={link.geometry}
          >
            {t('tabGeometry')}
          </Button>
          <Button
            style={styles.button}
            color={this.isActive('material')}
            onTouchTap={link.material}
          >
            {t('tabMaterial')}
          </Button>
          <Button
            style={styles.button}
            color={this.isActive('beam')}
            onTouchTap={link.beam}
          >
            {t('tabBeam')}
          </Button>
          <Button
            style={styles.button}
            color={this.isActive('detectors')}
            onTouchTap={link.detectors}
          >
            {t('tabDetectors')}
          </Button>
        </Toolbar>

        {
          isWorkspaceLoading
            ? (
              <div className={classes.container}>
                <CircularProgress size={70} />
              </div>
            )
            : children
        }
      </AppLayout>
    );
  }
}

const styles = (theme: Object) => ({
  toolbar: {
    background: theme.palette.grey[800],
    display: 'flex',
    flexDirection: 'row',
  },
  toolbarTitle: {
    flex: '1 0 0',
  },
  container: {
    ...Style.Flex.elementEqual,
    ...Style.Flex.rootColumn,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});

export default withStyles(styles)(WorkspaceLayout);

