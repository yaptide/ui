/* @flow */

export const baseURL = BASE_URL;

export type Endpoint = 'LOGIN' |
  'REGISTER';

const endpoints = {
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
};

export default endpoints;
