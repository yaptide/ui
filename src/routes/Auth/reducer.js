/* @flow */

import { Map } from 'immutable';

import type { AuthState, RegisterData, LoginData } from './model';

export const actionType = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_RESPONSE_ERROR: 'LOGIN_RESPONSE_ERROR',
  LOGIN_RESPONSE_SUCCESS: 'LOGIN_RESPONSE_SUCCESS',
  CLEAR_LOGIN_ERROR: 'CLEAR_LOGIN_ERROR',

  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_RESPONSE_ERROR: 'REGISTER_RESPONSE_ERROR',
  REGISTER_RESPONSE_SUCCESS: 'REGISTER_RESPONSE_SUCCESS',
  CLEAR_REGISTER_ERROR: 'CLEAR_REGISTER_ERROR',

  LOGOUT: 'LOGOUT',
};

const ACTION_HANDLERS = {
  [actionType.LOGIN_REQUEST]: (state: AuthState) => {
    return state.merge({ isLoginPending: true });
  },
  [actionType.LOGIN_RESPONSE_SUCCESS]: (state: AuthState, action) => {
    return state.merge({ token: action.token, isLoginPending: false });
  },
  [actionType.LOGIN_RESPONSE_ERROR]: (state: AuthState, action) => {
    return state.merge({ loginError: action.error, isLoginPending: false });
  },
  [actionType.CLEAR_LOGIN_ERROR]: (state: AuthState, action: {field: string}) => {
    return state.deleteIn(['loginError', action.field]);
  },
  [actionType.REGISTER_REQUEST]: (state) => {
    return state.merge({ isRegisterPending: true });
  },
  [actionType.REGISTER_RESPONSE_SUCCESS]: (state) => {
    return state.merge({ isRegisterPending: false });
  },
  [actionType.REGISTER_RESPONSE_ERROR]: (state, action) => {
    return state.merge({ registerError: action.error, isRegisterPending: false });
  },
  [actionType.CLEAR_REGISTER_ERROR]: (state: AuthState, action: {field: string}) => {
    return state.deleteIn(['registerError', action.field]);
  },
  [actionType.LOGOUT]: (state: AuthState) => {
    return state.delete('token');
  },
};

export const actionCreator = {
  login: (user: LoginData) => {
    return {
      type: actionType.LOGIN_REQUEST,
      user,
    };
  },
  register: (user: RegisterData) => {
    return {
      type: actionType.REGISTER_REQUEST,
      user,
    };
  },
  clearLoginError: (field: string) => {
    return {
      type: actionType.CLEAR_LOGIN_ERROR,
      field,
    };
  },
  clearRegisterError: (field: string) => {
    return {
      type: actionType.CLEAR_REGISTER_ERROR,
      field,
    };
  },
};

const initialState = Map();
export const reducer = (state: AuthState = initialState, action: { type: string }) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
