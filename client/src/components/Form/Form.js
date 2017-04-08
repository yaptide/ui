/* @flow */

import React, { Element } from 'react';
import type { ApplicationRoute } from 'routes/model';
import RaisedButton from 'material-ui/RaisedButton';

import Style from 'styles';

import FormLink from './FormLink';

type Props = {
  children?: Array<Element<*>>,
  submit: () => void,
  submitText: string,
  links: Array<{
    text: string,
    url: ApplicationRoute
  }>,
};

class Form extends React.Component {
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
        <RaisedButton
          onClick={this.props.submit}
          primary
          label={this.props.submitText}
        />
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
