/* @flow */

import type { ButtonInfo } from './Alert';

export { default as Alert } from './Alert';

const dialogUtils = {
  alertRef: undefined,
  showAlert(title: string, content: string, buttons: Array<ButtonInfo>, handlers?: Object) {
    return this.alertRef && this.alertRef.showAlert(title, content, buttons, handlers);
  },
};


export default dialogUtils;

