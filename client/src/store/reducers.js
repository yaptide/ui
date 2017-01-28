
import { combineReducers } from 'redux';

import { routerReducer as routing } from 'react-router-redux';

export const makeRootReducer = () =>
  combineReducers({
    routing,
  });

