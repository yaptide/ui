/* @flow */

import React from 'react';
import Style from 'styles';
import { t } from 'i18n';
import { FormLink } from 'components/Form';
import AppLayout from '../AppLayout';

class Logout extends React.Component {

  render() {
    return (
      <AppLayout>
        <div style={styles.container}>
          <p style={styles.title}>
            {t('empty.logout.title')}
          </p>
          <p style={styles.description}>
            {t('empty.logout.body1')}
            <FormLink text={t('empty.logout.home')} url="/welcome" />
            {t('empty.logout.body2')}
            <FormLink text={t('empty.logout.login')} url="/auth/login" />
            {t('empty.logout.body3')}
          </p>
        </div>
      </AppLayout>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.elementEqual,
    alignSelf: 'center',
    justifyContent: 'stretch',
    width: '500px',
  },
  title: {
    fontSize: Style.Dimens.font.huge,
    fontFamily: Style.Theme.fontFamily,
    color: Style.Theme.palette.textColor,
    paddingTop: Style.Dimens.spacing.veryLarge,
  },
  description: {
    dispaly: 'flex',
    fontSize: Style.Dimens.font.standard,
    fontFamily: Style.Theme.fontFamily,
    color: Style.Theme.palette.textColor,
    paddingTop: Style.Dimens.spacing.normal,
  },
};

export default Logout;
