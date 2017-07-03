/* @flow */

export const baseURL = BASE_URL;

export type Endpoint = 'LOGIN' |
  'REGISTER';

const endpoints = {
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  PROJECT: 'projects',
  projectById: (project: string) => `projects/${project}`,
  versionByProjectId: (project: string) => `projects/${project}/versions`,
  versionByProjectIdFromVersionId: (projectId: string, versionId: number) => (
    `projects/${projectId}/versions/create/from/${versionId}`
  ),

  setupById: (simulation: string) => `simulation/setup/${simulation}`,
};

export default endpoints;
