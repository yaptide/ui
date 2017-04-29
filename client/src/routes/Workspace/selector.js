/* @flow */

import { Map } from 'immutable';

function visualisationSelector(state: { workspace: Map<string, any> }) {
  return state.workspace;
}

export default {
  visualisationSelector,
};
