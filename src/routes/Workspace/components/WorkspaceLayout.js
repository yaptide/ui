/* @flow */

import React from 'react';

import { CircularProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Toolbar from 'material-ui/Toolbar';
import { withStyles } from 'material-ui/styles';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import SaveIcon from 'material-ui-icons/Save';
import PlayIcon from 'material-ui-icons/PlayCircleOutline';
import BackIcon from 'material-ui-icons/ArrowBack';
import AppLayout from 'pages/AppLayout';
import router from 'utils/router';
import { t } from 'i18n';

const link = {
  geometry: () => router.push('/workspace/geometry'),
  material: () => router.push('/workspace/material'),
  beam: () => router.push('/workspace/beam'),
  detectors: () => router.push('/workspace/detectors'),
  options: () => router.push('/workspace/options'),
};

type Props = {
  activeWorkspaceTab?: string,

  isSyncPending: bool,
  viewOnly: bool,
  isLoggedIn: bool,
  isWorkspaceDropDownOpen: bool,
  isProject: bool,
  isSimulationStarting: bool,
  isSimulationValid: bool,

  backToProject: () => void,
  startSimulation: () => void,
  syncWorkspace: () => void,
  toggleDropDown: () => void,

  children: React$Element<*>,
  classes: Object,
}

class WorkspaceLayout extends React.Component<Props> {
  props: Props

  isActive = (tab: string) => {
    return this.props.activeWorkspaceTab === `/workspace/${tab}` ? 'accent' : undefined;
  }

  render() {
    const {
      isLoggedIn,
      viewOnly,
      classes,
    } = this.props;

    return (
      <AppLayout
        classes={{ root: classes.appLayout }}
      >
        <Toolbar className={classes.toolbar} >
          {
            this.props.isProject
              ? (
                <IconButton
                  onClick={this.props.backToProject}
                >
                  <BackIcon />
                </IconButton>
              )
              : null
          }
          <Button
            color={this.isActive('options')}
            onClick={link.options}
          >
            {t('tabOptions')}
          </Button>
          <Button
            color={this.isActive('geometry')}
            onClick={link.geometry}
          >
            {t('tabGeometry')}
          </Button>
          <Button
            color={this.isActive('material')}
            onClick={link.material}
          >
            {t('tabMaterial')}
          </Button>
          <Button
            color={this.isActive('beam')}
            onClick={link.beam}
          >
            {t('tabBeam')}
          </Button>
          <Button
            color={this.isActive('detectors')}
            onClick={link.detectors}
          >
            {t('tabDetectors')}
          </Button>
          <div className={classes.toolbarFlexSeparator} />
          <IconButton
            disabled={viewOnly || !isLoggedIn}
            onClick={this.props.startSimulation}
          >
            {
              this.props.isSimulationStarting
                ? <CircularProgress
                  size={25}
                  thickness={10}
                  classes={{ circle: classes.whiteIcon }}
                />
                : <PlayIcon className={classes.whiteIcon} />
            }
          </IconButton>

          <IconButton
            disabled={viewOnly || !isLoggedIn}
            onClick={this.props.syncWorkspace}
          >
            {
              this.props.isSyncPending
                ? <CircularProgress
                  size={25}
                  thickness={10}
                  classes={{ circle: classes.whiteIcon }}
                />
                : <SaveIcon className={classes.whiteIcon} />
            }
          </IconButton>


          <IconButton
            color="accent"
            onClick={this.props.toggleDropDown}
          >
            <MoreVertIcon />
          </IconButton>

        </Toolbar>
        {
          React.cloneElement(this.props.children, (
            this.props.children.type === 'div'
            ? {}
            : { classes: { root: classes.content } }
          ))
        }
      </AppLayout>
    );
  }
}


const styles = (theme: Object) => ({
  appLayout: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  toolbar: {
    background: theme.palette.grey[800],
    display: 'flex',
    flexDirection: 'row',
  },
  toolbarFlexSeparator: {
    flex: '1 0 0',
  },
  title: {
    paddingRight: theme.spacing.unit * 2,
  },
  whiteIcon: {
    color: '#FFFFFF',
  },
  content: {
    flex: '1 0 0',
    alignSelf: 'stretch',
  },
});


export default withStyles(styles)(WorkspaceLayout);
