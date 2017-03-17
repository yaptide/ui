/* @flow */

import { hashHistory } from 'react-router';

const wrapPush = (path) => {
  if (`#${path}` !== window.location.hash) { // eslint-disable-line
    hashHistory.push(path);
  }
};


const router = {
  push: (route: string) => {
    wrapPush(route);
  },
};

export default router;
