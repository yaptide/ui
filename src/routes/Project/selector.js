/* @flow */

import type { Store } from 'store/reducers';
import type { Project, Version, Settings } from 'model/project';

function projectListSelector(state: Store): Array<Project> {
  return state.project.get('projectIds');
}

function projectSelector(state: Store, projectId: string): ?Project {
  const project = state.project.getIn(['projects', projectId, 'project']);
  return project ? project.toJS() : undefined;
}

function versionSelector(
  state: Store, projectId: string, versionId: number,
): ?Version {
  const version = state.project.getIn(['projects', projectId, 'versions', String(versionId)]);
  return version ? version.toJS() : undefined;
}

function versionSettingsSelector(
  state: Store, projectId: string, versionId: number,
): ?Settings {
  const settings = state.project.getIn(
    ['projects', projectId, 'versions', String(versionId), 'settings'],
  );
  return settings ? settings.toJS() : undefined;
}


export default {
  projectListSelector,
  projectSelector,
  versionSelector,
  versionSettingsSelector,
};
