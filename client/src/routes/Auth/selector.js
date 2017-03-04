/* @flow */

import type { Store } from 'store/reducers';

export const authSelector = (state: Store) => state.auth;


export default {
  authSelector,
};
