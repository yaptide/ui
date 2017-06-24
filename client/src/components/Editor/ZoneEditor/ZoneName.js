/* @flow */

import React from 'react';

import TextField from 'material-ui/TextField';
import Style from 'styles';

const UNDEFINED_ZONE = '-------------';

class ZoneName extends React.Component {
  props: {
    name: string,
    updateName: (value: string) => void,
  }
  state: {
    isEditOn: bool,
    name: string,
  } = {
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

  setRef = (ref: any) => ref && ref.focus()

  render() {
    return (
      <div>
        {
          this.state.isEditOn
            ? <TextField
              value={this.state.name}
              name="zone name"
              onBlur={this.stopEditing}
              onChange={this.updateName}
              ref={this.setRef}
            />
            : <div
              onDoubleClick={this.makeEditable}
              style={styles.label}
            >
              {this.props.name || UNDEFINED_ZONE}
            </div>
        }
      </div>
    );
  }
}

const styles = {
  label: {
    fontSize: Style.Dimens.font.large,
  },
};

export default ZoneName;
