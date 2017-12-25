/* @flow */

import type { Store } from 'store/reducers';
import type { DetectorResultId, DetectorResultsInfo, Score } from 'model/result';

function resultsListSelector(
  state: Store, projectId: string, versionId: string,
): ?Array<DetectorResultId> {
  if (projectId || versionId) { /* tmp */ }
  return state.results.get('detectorIds');
}

function resultOverviewSelector(state: Store, detectorId: DetectorResultId): ?DetectorResultsInfo {
  const overview = state.results.getIn(['detectors', detectorId]);
  return overview ? overview.toJS() : undefined;
}

function resultScoreSelector(state: Store, detectorId: DetectorResultId): ?Score {
  const score = state.results.getIn(['detectorsScore', detectorId]);
  return score ? score.toJS() : undefined;
}

export default {
  resultsListSelector,
  resultOverviewSelector,
  resultScoreSelector,
};
