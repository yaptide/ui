/* @flow */

/*
 * arg1...arg4 is good enough solution
 * Loop over arguments variable would be less eficient.
 * More than 4 arguments would be too much either way
 */

export const withMutations = (func: Function) => (
  (state: Object, arg1: any, arg2: any, arg3: any, arg4: any) => { // eslint-disable-line
    return state.withMutations(store => func(store, arg1, arg2, arg3, arg4));
  }
);
