/* @flow */

import React from 'react';

import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

const UNDEFINED_ZONE = '-------------';

type Props = {
  name: string,
  label: string,
  updateName: (value: string) => void,
  classes: Object,
};

type State = {
  isEditOn: bool,
  name: string,
};

class EditableName extends React.Component<Props, State> {
  props: Props
  state: State = {
    isEditOn: false,
    name: this.props.name,
  }
  textFieldRef: any

  makeEditable = () => {
    this.setState({ isEditOn: true });
  }
  stopEditing = () => {
    this.setState({ isEditOn: false });
    this.props.updateName(this.state.name);
  }
  updateName = (e: Object) => this.setState({ name: e.target.value });

  setRef = (ref: any) => ref && ref.focus();

  render() {
    const classes = this.props.classes;
    return (
      this.state.isEditOn
        ? (
          <TextField
            value={this.state.name}
            onBlur={this.stopEditing}
            onChange={this.updateName}
            inputRef={this.setRef}
          />
        ) : (
          <div
            onDoubleClick={this.makeEditable}
          >
            <Typography
              className={classes.label}
              noWrap
            >
              {`${this.props.label}${this.props.name}` || UNDEFINED_ZONE}
            </Typography>
          </div>
        )
    );
  }
}

const styles = (theme: Object) => ({
  label: {
    ...theme.typography.subheading,
    paddingTop: 4,
    paddingBottom: 4,
  },
});

export default withStyles(styles)(EditableName);
