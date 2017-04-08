/* @flow */

import React from 'react';
import { RegisterForm } from 'routes/Auth';
import Paper from 'material-ui/Paper';
import Style from 'styles';
import Visualisation from 'components/Visualisation/Visualisation';
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
            <p style={styles.description}>We will make Palantir great again!</p>
            <Visualisation style={styles.visualisation} />
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
  },
  description: {
    flex: '0 0 1',
    overflow: 'hidden',
    fontSize: '30pt',
    fontFamily: Style.Theme.fontFamily,
    color: Style.Theme.palette.textColor,
    paddingLeft: Style.Dimens.spacing.normal,
    paddingRight: Style.Dimens.spacing.normal,
  },
  descriptionBlock: {
    ...Style.Flex.rootColumn,
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
