/* @flow */

import React from 'react';
import { t } from 'i18n';
import { FormInput } from 'components/Form';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';

type Props = {
  new?: bool,
  name: string,
  description: string,
  updateProject: (value: string, type: string) => void,
  submit: () => void,
  classes: Object,
}

class ProjectEditor extends React.Component<Props> {
  props: Props

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root} >
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
        <div className={classes.btnRow} >
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

const styles = (theme: Object) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: theme.spacing.unit * 2,
  },
  btnRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default withStyles(styles)(ProjectEditor);
