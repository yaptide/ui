/* @flow */

import { combineReducers } from 'redux';

import { routerReducer as routing } from 'react-router-redux';

const makeRootReducer = () => combineReducers({
  routing,
});

export default makeRootReducer;
