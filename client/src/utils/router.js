/* @flow */

import { hashHistory } from 'react-router';
import api from 'api';

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

export const redirectIfUnlogged = (redirectPage?: string) => (
  (nextState: string, replace: Function) => {
    if (!api.getAuthToken()) {
      replace(redirectPage || '/page403');
    }
  }
);

export const redirectIfLoggedIn = (redirectPage?: string) => (
  (nextState: string, replace: Function) => {
    if (api.getAuthToken()) {
      replace(redirectPage || '/welcome');
    }
  }
);

export default router;
