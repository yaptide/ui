/* @flow */

import React from 'react';
import Style from 'styles';
import CircularProgress from 'material-ui/CircularProgress';
import AppLayout from './AppLayout';


type Props = {
  activeWorkspaceTab?: string,
  isWorkspaceLoading?: bool,
  children?: React.Component<*, *, *>,
}

class WorkspaceLayout extends React.Component {
  props: Props;

  render() {
    const { children, activeWorkspaceTab, isWorkspaceLoading, ...props } = this.props;
    return (
      <AppLayout {...props} >
        <div style={styles.container}>
          {
            isWorkspaceLoading
            ? <CircularProgress size={70} thickness={6} />
            : children
          }
        </div>
      </AppLayout>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.elementEqual,
    ...Style.Flex.rootRow,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default WorkspaceLayout;

