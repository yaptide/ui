/* @flow */

import React from 'react';
import { Link } from 'react-router';
import { withStyles } from 'material-ui/styles';

import type { ApplicationRoute } from 'routes/model';

type Props = {
  url: ApplicationRoute,
  text: string,
  classes: Object,
}

class FormLink extends React.Component<Props> {
  props: Props

  render() {
    return (
      <Link
        to={this.props.url}
        className={this.props.classes.text}
      >
        {this.props.text}
      </Link>
    );
  }
}

const styles = (theme: Object) => ({
  text: {
    ...theme.typography.subheading,
    color: theme.palette.primary[400],
    '&:hover': {
      color: theme.palette.primary[300],
    },
  },
});

export default withStyles(styles)(FormLink);
