/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import { createStore } from './store/createStore';
import routes from './routes';

const store = createStore();
const history = syncHistoryWithStore(hashHistory, store);

const rootContainer = (
  <Provider store={store} >
    <Router history={history} routes={routes} />
  </Provider>
);

ReactDOM.render(rootContainer, document.getElementById('app'));

