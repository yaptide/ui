/* @flow */

import type { Store } from 'store/reducers';
import { fromJS } from 'immutable';
import * as _ from 'lodash';

const MOCK_DESCRIPTION_LONG = 'mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description'; //eslint-disable-line 

const projectListSelector = (state: Store) => {
  const mock = state; //eslint-disable-line
  // TODO replace by real implementation (blocked by API)

  return fromJS([1, 2, 3, 4, 5]);
};

const projectOverviewSelector = () => {
  const numberOfVersions = Math.floor((Math.random() * 10) + 1);
  return {
    id: 1,
    name: 'Example project 1',
    description: 'Short project description' + MOCK_DESCRIPTION_LONG, //eslint-disable-line
    versionIndices: _.times(numberOfVersions, () => Math.floor((Math.random() * 10) + 1)),
    lastBuildSucessfull: Math.random() > 0.3 ? Math.random() > 0.5 ? 'edited' : 'success' : 'error', // eslint-disable-line
  }; // eslint-disable-line
};


export default {
  projectListSelector,
  projectOverviewSelector,
};
