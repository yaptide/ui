/* @flow */

import React from 'react';
import Style from 'styles';
import { t } from 'i18n';
import { withStyles } from 'material-ui/styles';
import { FormLink } from 'components/Form';
import AppLayout from '../AppLayout';

type Props = {
  classes: Object,
};

class Logout extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <AppLayout classes={{ root: classes.layout }}>
        <div className={classes.container}>
          <p className={classes.title}>
            {t('empty.logout.title')}
          </p>
          <p className={classes.description}>
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

const styles = (theme: Object) => ({
  container: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'stretch',
    width: '500px',
  },
  title: {
    fontSize: theme.typography.display1.fontSize,
    color: theme.palette.grey[200],
    paddingTop: Style.Dimens.spacing.veryLarge,
  },
  description: {
    dispaly: 'flex',
    fontSize: Style.Dimens.font.standard,
    color: theme.palette.grey[200],
    paddingTop: Style.Dimens.spacing.normal,
  },
  layout: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export default withStyles(styles)(Logout);
