/* @flow */

import React from 'react';
import Style from 'styles';
import { t } from 'i18n';
import router from 'utils/router';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
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
}

class WorkspaceLayout extends React.Component {
  props: Props;

  isActive = (tab: string) => {
    return this.props.activeWorkspaceTab === tab;
  }

  render() {
    const { children, activeWorkspaceTab, isWorkspaceLoading, ...props } = this.props;
    return (
      <AppLayout {...props} >
        <Toolbar
          style={{ background: Style.Theme.palette.disabledColor }}
        >
          <ToolbarGroup>
            <ToolbarTitle
              text="Workspace"
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <FlatButton
              style={styles.button}
              label={t('tabSettings')}
              secondary={this.isActive('settings')}
              onTouchTap={link.settings}
            />
            <ToolbarSeparator style={styles.separator} />
            <FlatButton
              style={styles.button}
              label={t('tabGeometry')}
              secondary={this.isActive('geometry')}
              onTouchTap={link.geometry}
            />
            <FlatButton
              style={styles.button}
              label={t('tabMaterial')}
              secondary={this.isActive('material')}
              onTouchTap={link.material}
            />
            <FlatButton
              style={styles.button}
              label={t('tabBeam')}
              secondary={this.isActive('beam')}
              onTouchTap={link.beam}
            />
            <FlatButton
              style={styles.button}
              label={t('tabDetectors')}
              secondary={this.isActive('detectors')}
              onTouchTap={link.detectors}
            />
          </ToolbarGroup>
        </Toolbar>

        {
          isWorkspaceLoading
            ? (
              <div style={styles.container}>
                <CircularProgress size={70} thickness={6} />
              </div>
            )
            : children
        }
      </AppLayout>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.elementEqual,
    ...Style.Flex.rootColumn,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginLeft: '0px',
    marginRight: '0px',
  },
  separator: {
    marginLeft: '16px',
    marginRight: '16px',
  },
};

export default WorkspaceLayout;

