/* @flow */

import type { Store } from 'store/reducers';
import { fromJS } from 'immutable';
import * as _ from 'lodash';
import type { Project, ProjectDetails } from './model';

const MOCK_DESCRIPTION_LONG = 'mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description mock description'; //eslint-disable-line 

const projectListSelector = (state: Store) => {
  const mock = state; //eslint-disable-line
  // TODO replace by real implementation (blocked by API)

  return fromJS([1, 2, 3, 4, 5]);
};

const projectOverviewSelector = (): Project => {
  const numberOfVersions = Math.floor((Math.random() * 10) + 1);
  return {
    id: '12321h3b',
    name: 'Example project 1',
    description: 'Short project description' + MOCK_DESCRIPTION_LONG, //eslint-disable-line
    versionIndices: _.times(numberOfVersions, () => String(Math.floor((Math.random() * 10) + 1))),
  }; // eslint-disable-line
};

const projectDetailsSelector = (): ProjectDetails => {
  return {
    id: 'rwhgur',
    name: 'Example project 1',
    description: 'Short project description' + MOCK_DESCRIPTION_LONG, // eslint-disable-line
    versions: [
      {
        id: 1,
        setupId: 'wuiergfier',
        resultsId: 'wrgunferioufn',
        errors: undefined,
        status: 'error',
        settings: {
          library: 'shield',
          engine: 'local',
        },
      }, {
        id: 2,
        setupId: 'erihbgfir',
        resultsId: 'wrufiurnwi',
        errors: ['SHIELD HIT ERROR', 'PARSING ERRROR...'],
        status: 'success',
        settings: {
          library: 'shield',
          engine: 'plgrid',
        },
      }, {
        id: 3,
        setupId: 'erihbgfir',
        resultsId: 'wrufiurnwi',
        errors: ['SHIELD HIT ERROR', 'PARSING ERRROR...'],
        status: 'current',
        settings: {
          library: 'shield',
          engine: 'plgrid',
        },
      },
    ],
  };
};

export default {
  projectListSelector,
  projectOverviewSelector,
  projectDetailsSelector,
};
