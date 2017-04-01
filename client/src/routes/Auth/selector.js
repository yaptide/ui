/* @flow */

import type { Store } from 'store/reducers';
import { Map } from 'immutable';

const authSelector = (state: Store) => state.auth;

const loginSelector = (state: Store) => {
  const auth = authSelector(state);

  return {
    isLoginPending: auth.get('isLoginPending', false),
    loginError: auth.get('loginError', Map()).toJS(),
  };
};

const registerSelector = (state: Store) => {
  const auth = authSelector(state);

  return {
    isRegisterPending: auth.get('isRegisterPending', false),
    registerError: auth.get('registerError', Map()).toJS(),
  };
};

export default {
  authSelector,
  loginSelector,
  registerSelector,
};
