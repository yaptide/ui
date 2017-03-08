/* @flow */

import { Map } from 'immutable';

import type { AuthState } from './model';

export const actionType = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_RESPONSE_ERROR: 'LOGIN_RESPONSE_ERROR',
  LOGIN_RESPONSE_SUCCESS: 'LOGIN_RESPONSE_SUCCESS',

  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_RESPONSE_ERROR: 'REGISTER_RESPONSE_ERROR',
  REGISTER_RESPONSE_SUCCESS: 'REGISTER_RESPONSE_SUCCESS',
};

const ACTION_HANDLERS = {
};

export const actionCreator = {
  login: (user: string, password: string) => {
    return {
      type: actionType.LOGIN_REQUEST,
      user,
      password,
    };
  },
};

const initialState = Map();
export const reducer = (state: AuthState = initialState, action: { type: string }) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
