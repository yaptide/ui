/* @flow */

import React from 'react';
import { RegisterForm } from 'routes/Auth';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import Style from 'styles';
import AppLayout from '../AppLayout';

type Props = {
  classes: Object,
};

class WelcomePage extends React.Component<Props> {
  props: Props;

  render() {
    const classes = this.props.classes;
    return (
      <AppLayout>
        <div className={classes.container}>
          <div className={classes.descriptionBlock} >
            <h1 className={classes.description} >Getting started</h1>
            <p className={classes.text} >You can see demo of this application <a href="#/workspace/geometry">here</a>.</p>
            <br />
            <p className={classes.text} >Basic info about app during development.</p>
            <p className={classes.text} > - Email is not validated durring registration.</p>
            <p className={classes.text} > - Every deploy should have at least user with credentials {'"'}username{'"'} and {'"'}password{'"'}.</p>
            <p className={classes.text} >
              - Workspace for unlogged user contains only demo of functionality.
              To see all features of application you need to logg in.
            </p>
            <br />
            <br />
            <p className={classes.text} >Palantir is an application ...</p>
          </div>
          <div className={classes.form}>
            <Paper className={this.props.classes.formWrapper} elevation={4} >
              <RegisterForm includeLinks={false} />
            </Paper>
          </div>
        </div>
      </AppLayout>
    );
  }
}

const styles = (theme: Object) => ({
  container: {
    ...Style.Flex.rootRow,
    ...Style.Flex.elementEqual,
    justifyContent: 'stretch',
    paddingTop: Style.Dimens.spacing.veryLarge,
    paddingLeft: Style.Dimens.spacing.veryLarge,
    paddingRight: Style.Dimens.spacing.veryLarge,
    paddingBottom: Style.Dimens.spacing.veryLarge,
  },
  description: {
    flex: '0 0 1',
    overflow: 'hidden',
    fontSize: '30pt',
    color: theme.palette.grey[200],
    paddingRight: Style.Dimens.spacing.normal,
  },
  text: {
    fontSize: Style.Dimens.font.standard,
    color: theme.palette.grey[200],
  },
  descriptionBlock: {
    ...Style.Flex.rootColumn,
    paddingLeft: Style.Dimens.spacing.normal,
    flex: '1 0 0',
    overflow: 'hidden',
  },
  visualisation: {
    flex: '1 0 0',
  },
  form: {
    overflow: 'hidden',
    width: '300px',
    paddingLeft: Style.Dimens.spacing.normal,
    paddingRight: Style.Dimens.spacing.normal,
    ...Style.Flex.rootColumn,
  },
  formWrapper: {
    padding: Style.Dimens.spacing.normal,
    flex: '0 0 1',
  },
});

export default withStyles(styles)(WelcomePage);
