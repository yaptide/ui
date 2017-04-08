/* @flow */

import React from 'react';
import { Link } from 'react-router';

import Style from 'styles';

import type { ApplicationRoute } from 'routes/model';

class FormLink extends React.Component {
  props: {
    url: ApplicationRoute,
    text: string,
  }

  render() {
    return (
      <Link to={this.props.url} >
        <p style={styles.text}>{this.props.text}</p>
      </Link>
    );
  }
}

const styles = {
  text: {
    paddingTop: Style.Dimens.spacing.small,
    fontSize: Style.Dimens.font.standard,
    fontFamily: 'Roboto',
    color: Style.Theme.palette.primary1Color,
  },
};

export default FormLink;
