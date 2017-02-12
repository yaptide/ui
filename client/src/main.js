/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { setupTranslationsInStore } from './i18n';

import { createStore } from './store/createStore';
import routes from './routes';

const store = createStore();
const history = syncHistoryWithStore(hashHistory, store);
setupTranslationsInStore(store);

const rootContainer = (
  <Provider store={store} >
    <div style={{ height: '100%' }} >
      <Router history={history} routes={routes} />
    </div>
  </Provider>
);

ReactDOM.render(rootContainer, document.getElementById('app'));

