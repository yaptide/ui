/* @flow */

export const baseURL = `${location.protocol}//${BACKEND_PUBLIC_URL}`;

export type Endpoint = 'LOGIN' |
  'REGISTER';

const endpoints = {
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  CONFIGURATION: 'configuration',
  PROJECT: 'projects',
  projectById: (project: string) => `projects/${project}`,
  versionByProjectId: (project: string) => `projects/${project}/versions`,
  versionByProjectIdFromVersionId: (projectId: string, versionId: number) => (
    `projects/${projectId}/versions/create/from/${versionId}`
  ),
  simulationSetup: (projectId: string, versionId: number) => (
    `projects/${projectId}/versions/${versionId}/setup`
  ),
  simulationResults: (projectId: string, versionId: number) => (
    `projects/${projectId}/versions/${versionId}/result`
  ),
  version: (projectId: string, versionId: number) => (
    `projects/${projectId}/versions/${versionId}`
  ),
  SIMULATION_RUN: 'simulation/run',
};

export default endpoints;
