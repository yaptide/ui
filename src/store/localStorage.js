/* @flow */

type Key
  = 'AUTH_TOKEN'
  | 'WORKSPACE_SYNC';

export const key: {[Key]: Key} = {
  AUTH_TOKEN: 'AUTH_TOKEN',
  WORKSPACE_SYNC: 'WORKSPACE_SYNC',
};

export default {
  get(k: Key): any {
    const wrapper = JSON.parse(window.localStorage.getItem(k));
    return wrapper && wrapper.item;
  },
  set(k: Key, value: any) {
    window.localStorage.setItem(k, JSON.stringify({ item: value }));
  },
  delete(k: Key) {
    window.localStorage.removeItem(k);
  },
  clear() {
    window.localStorage.clear();
  },
};
