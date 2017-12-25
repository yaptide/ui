/* @flow */

import React from 'react';
import type { ApplicationRoute } from 'routes/model';
import Button from 'material-ui/Button';

import Style from 'styles';

import FormLink from './FormLink';

type Props = {
  children?: Array<any>,
  submit: () => void,
  submitText: string,
  links: Array<{
    text: string,
    url: ApplicationRoute
  }>,
};

class Form extends React.Component<Props> {
  static defaultProps = { links: [] }
  props: Props

  render() {
    return (
      <div style={styles.form} >
        {this.props.children}
        <div style={{ height: Style.Dimens.spacing.normal }} />
        {
          this.props.links.map((e, i) => (
            <FormLink url={e.url} text={e.text} key={i} />
          ))
        }
        <div style={{ height: Style.Dimens.spacing.normal }} />
        <Button
          onClick={this.props.submit}
          color="primary"
          raised
        >
          {this.props.submitText}
        </Button>
      </div>
    );
  }
}

const styles = {
  form: {
    ...Style.Flex.rootColumn,
    alignItems: 'stretch',
  },
};

export default Form;
