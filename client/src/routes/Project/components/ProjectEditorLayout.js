/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import Style from 'styles';

type Props = {
  children: React$Element<*>,
}

class ProjectEditorLayout extends React.Component<Props> {
  props: Props

  render() {
    return (
      <div style={styles.formWrapper} >
        <Paper style={styles.paper} elevation={4} >
          {this.props.children}
        </Paper>
      </div>
    );
  }
}


const styles = {
  formWrapper: {
    width: Style.Dimens.fixedPageWidth,
    alignSelf: 'center',
    padding: Style.Dimens.spacing.normal,
  },
  paper: {
    padding: Style.Dimens.spacing.large,
  },
};

export default ProjectEditorLayout;
