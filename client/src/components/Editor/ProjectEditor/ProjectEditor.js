/* @flow */

import React from 'react';
import { t } from 'i18n';
import { FormInput } from 'components/Form';
import RaisedButton from 'material-ui/RaisedButton';
import Style from 'styles';

type Props = {
  new?: bool,
  name: string,
  description: string,
  updateProject: (value: string, type: string) => void,
  submit: () => void,
}

class ProjectEditor extends React.Component {
  props: Props

  render() {
    return (
      <div style={styles.container} >
        <FormInput
          type="name"
          floatingLabelText={t('project.form.name')}
          value={this.props.name}
          onChange={this.props.updateProject}
          fullWidth
        />
        <FormInput
          type="description"
          floatingLabelText={t('project.form.description')}
          value={this.props.description}
          onChange={this.props.updateProject}
          fullWidth
          multiLine
          textareaStyle={styles.textArea}
          rows={3}
        />
        <div style={styles.btnRow} >
          <RaisedButton
            label={this.props.new ? t('project.form.createBtn') : t('project.form.updateBtn')}
            onTouchTap={this.props.submit}
            primary
          />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    ...Style.Flex.rootColumn,
    alignItems: 'stretch',
    padding: Style.Dimens.spacing.normal,
  },
  textArea: {
  },
  btnRow: {
    ...Style.Flex.rootRow,
    justifyContent: 'flex-end',
  },
};

export default ProjectEditor;
