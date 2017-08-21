/* @flow */

import React from 'react';
import { RegisterForm } from 'routes/Auth';
import Paper from 'material-ui/Paper';
import Style from 'styles';
import AppLayout from '../AppLayout';

type Props = {
  location: {
    pathname: string,
  },
};

class WelcomePage extends React.Component {
  props: Props;

  render() {
    return (
      <AppLayout
        location={this.props.location.pathname}
      >
        <div style={styles.container}>
          <div style={styles.descriptionBlock} >
            <h1 style={styles.description} >Getting started</h1>
            <p style={styles.text} >You can see demo of this application <a href="#/workspace/geometry">here</a>.</p>
            <br />
            <p style={styles.text} >Basic info about app durring development.</p>
            <p style={styles.text} > - Email is not validated durring registration.</p>
            <p style={styles.text} > - Every deploy should have at least user with credentials {'"'}username{'"'} and {'"'}password{'"'}.</p>
            <p style={styles.text} >
              - Workspace for unlogged user contains only demo of functionality.
              To see all features of application you need to logg in.
            </p>
            <br />
            <br />
            <p style={styles.text} >Palantir is an application ...</p>
          </div>
          <div style={styles.form}>
            <Paper style={styles.formWrapper} zDepth={3} >
              <RegisterForm includeLinks={false} />
            </Paper>
          </div>
        </div>
      </AppLayout>
    );
  }
}

const styles = {
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
    fontFamily: Style.Theme.fontFamily,
    color: Style.Theme.palette.textColor,
    paddingRight: Style.Dimens.spacing.normal,
  },
  text: {
    fontSize: Style.Dimens.font.standard,
    fontFamily: Style.Theme.fontFamily,
    color: Style.Theme.palette.textColor,
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
};

export default WelcomePage;
