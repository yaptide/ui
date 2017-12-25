/* @flow */

import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import dialogUtils from './index';

export type ButtonInfo = {
  name: string,
  action: () => void,
  active: bool,
};
type Props = {};
type State = {
  open: bool,
  title: string,
  content: string,
  buttons: Array<ButtonInfo>,
  handlers?: Object,
};

class Alert extends React.Component<Props, State> {
  props: Props
  state: State = {
    open: false,
    title: '',
    content: '',
    buttons: [],
    handlers: undefined,
  }

  componentWillMount() {
    dialogUtils.alertRef = this;
  }

  componentWillUnmount() {
    dialogUtils.alertRef = undefined;
  }

  showAlert = (title: string, content: string, buttons: Array<ButtonInfo>, handlers?: Object) => {
    this.setState({
      open: true,
      title,
      content,
      buttons,
      handlers,
    });
  }

  handleClose = () => {
    this.setState({
      open: false,
      title: '',
      content: '',
      buttons: [],
      handlers: undefined,
    });
    return this.state.handlers && this.state.handlers.onClose && this.state.handlers.onClose();
  }

  onAction = (action: (any) => void) => (event: any) => {
    this.setState({
      open: false,
      title: '',
      content: '',
      buttons: [],
      handlers: undefined,
    });
    action(event);
  }

  render() {
    return (
      <Dialog
        open={this.state.open}
        onBackdropClick={this.handleClose}
        onEscapeKeyUp={this.handleClose}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {this.state.title ? <DialogTitle id="alert-dialog-title">{this.state.title}</DialogTitle> : null }
        {
          this.state.content
            ? <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.state.content}
              </DialogContentText>
            </DialogContent>
            : null
        }
        <DialogActions>
          {
            this.state.buttons.map(button => (
              <Button
                key={button.name}
                onClick={this.onAction(button.action)}
                raised
                color={button.active ? 'primary' : undefined}
              >
                {button.name}
              </Button>
            ))
          }
        </DialogActions>
      </Dialog>
    );
  }
}

export default Alert;
