/* @flow */

import cookie from 'react-cookie';

type Key = 'AUTH_TOKEN';

export const key: {[Key]: Key} = {
  AUTH_TOKEN: 'AUTH_TOKEN',
};

export default {
  get(k: Key): any {
    return cookie.load(k);
  },
  set(k: Key, value: any) {
    cookie.save(k, value);
  },
  delete(k: Key) {
    cookie.remove(k);
  },
};
