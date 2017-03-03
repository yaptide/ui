/* @flow */

import React from 'react';
import { Link } from 'react-router';
import Style from 'styles';
import { t } from 'i18n';

import { Button } from 'components/Touchable';

type Action = {
  label: string,
  handler: () => void,
}

type Props = {
  buttons: Array<Action>,
  //  menu?: Array<Action>,
};

class Header extends React.Component {
  static defaultProps = { buttons: [], menu: [] };

  props: Props;

  render() {
    const buttons = this.props.buttons.map((e, i) => {
      return (
        <Button
          key={i}
          title={e.label}
          onClick={e.handler}
          style={{ ...styles.button, ...(e.isActive ? styles.activeBtn : undefined) }}
        />
      );
    });

    return (
      <div style={styles.header}>
        <Link
          to="/"
          style={styles.linkStyle}
        >
          <p style={styles.title} >{t('appName')}</p>
        </Link>
        <div style={Style.Flex.elementEqual} />
        {buttons}
      </div>
    );
  }
}

const styles = {
  header: {
    ...Style.Flex.rootRow,
    background: Style.Colors.primary,
    height: Style.Dimens.spacing.veryLarge,
    alignItems: 'center',
    paddingLeft: Style.Dimens.spacing.normal,
    paddingRight: Style.Dimens.spacing.normal,
  },
  linkStyle: {
    textDecoration: 'none',
  },
  title: {
    color: Style.Colors.white,
    fontSize: Style.Dimens.font.huge,
  },
  button: {
    paddingTop: Style.Dimens.spacing.small,
    paddingBottom: Style.Dimens.spacing.small,
    fontSize: Style.Dimens.font.standard,
    color: Style.Colors.secondary,
    background: Style.Colors.white,
    fontWeight: 'bold',
  },
  activeBtn: {
    background: Style.Colors.secondary,
    color: Style.Colors.white,
  },
};

export default Header;
