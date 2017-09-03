/* @flow */

import React from 'react';
import { t } from 'i18n';
import { FormInput } from 'components/Form';
import Button from 'material-ui/Button';
import Style from 'styles';

type Props = {
  new?: bool,
  name: string,
  description: string,
  updateProject: (value: string, type: string) => void,
  submit: () => void,
}

class ProjectEditor extends React.Component<Props> {
  props: Props

  render() {
    return (
      <div style={styles.container} >
        <FormInput
          type="name"
          label={t('project.form.name')}
          value={this.props.name}
          onChange={this.props.updateProject}
          fullWidth
        />
        <FormInput
          type="description"
          label={t('project.form.description')}
          value={this.props.description}
          onChange={this.props.updateProject}
          fullWidth
          multiline
        />
        <div style={styles.btnRow} >
          <Button
            onTouchTap={this.props.submit}
            color="primary"
            raised
          >
            {this.props.new ? t('project.form.createBtn') : t('project.form.updateBtn')}
          </Button>
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
  btnRow: {
    ...Style.Flex.rootRow,
    justifyContent: 'flex-end',
  },
};

export default ProjectEditor;
