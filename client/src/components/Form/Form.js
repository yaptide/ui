/* @flow */

import React, { Element } from 'react';
import type { ApplicationRoute } from 'routes/model';

import Style from 'styles';

import FormButton from './FormButton';
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
  props: Props

  render() {
    return (
      <div style={styles.form} >
        {
          (this.props.children || []).map((e, i) => (
            React.cloneElement(e, { inputStyle: styles.formInput, key: i })
          ))
        }
        {
          this.props.links.map((e, i) => (
            <FormLink url={e.url} text={e.text} key={i} />
          ))
        }
        <div style={{ height: Style.Dimens.spacing.normal }} />
        <FormButton
          onClick={this.props.submit}
          btnText={this.props.submitText}
        />
      </div>
    );
  }
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  formInput: {
    marginTop: Style.Dimens.spacing.normal,
  },
};

export default Form;
