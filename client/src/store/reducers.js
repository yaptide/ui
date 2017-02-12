/* @flow */

import { combineReducers } from 'redux';

import { routerReducer as routing } from 'react-router-redux';
import { i18nReducer as i18n } from 'react-redux-i18n';

const makeRootReducer = () => combineReducers({
  routing,
  i18n,
});

export default makeRootReducer;
