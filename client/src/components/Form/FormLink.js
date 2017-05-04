/* @flow */

import React from 'react';
import { Link } from 'react-router';

import Style from 'styles';

import type { ApplicationRoute } from 'routes/model';

class FormLink extends React.Component {
  props: {
    url: ApplicationRoute,
    text: string,
    style?: Object,
  }

  render() {
    return (
      <Link to={this.props.url} style={{ ...styles.text, ...this.props.style }} >
        {this.props.text}
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
