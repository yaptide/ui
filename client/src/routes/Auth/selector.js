/* @flow */

import type { State } from 'store/reducers';

export const authSelector = (state: State) => state.auth;


export default {
  authSelector,
};
