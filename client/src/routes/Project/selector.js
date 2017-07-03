/* @flow */

import type { Store } from 'store/reducers';
import { Map, Seq } from 'immutable';
import type { Project, ProjectDetails } from 'model/project';


const projectListSelector = (state: Store) => {
  return state.project.get('projectIds', Seq());
};

const projectOverviewSelector = (state: Store, projectId: string): Project => {
  return state.project.getIn(['projects', projectId], Map()).toJS();
};

const projectDetailsSelector = (): ProjectDetails => {
  return {
    id: 'rwhgur',
    name: 'Example project 1',
    description: 'Short project description', // eslint-disable-line
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
