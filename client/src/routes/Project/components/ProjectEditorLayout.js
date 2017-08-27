/* @flow */

import React from 'react';
import Paper from 'material-ui/Paper';
import Style from 'styles';

class ProjectEditorLayout extends React.Component {
  props: {
    children?: React.Element<*>,
  }

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
