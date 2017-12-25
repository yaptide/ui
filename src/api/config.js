/* @flow */

import axios from 'axios';
import type { Endpoint } from './endpoint';
import { baseURL } from './endpoint'; // eslint-disable-line

const axiosInstance = axios.create({
  baseURL,
});

let authorizationToken = '';

axiosInstance.interceptors.request.use(
  (request) => {
    if (authorizationToken) {
      request.headers['X-Auth-Token'] = authorizationToken; // eslint-disable-line no-param-reassign
      request.headers['Content-Type'] = 'application/json'; // eslint-disable-line no-param-reassign
    }
    return request;
  },
  (error) => {
    Promise.reject(error);
  },
);


const api = {
  get: (endpoint: Endpoint, params?: Object) => axiosInstance.get(endpoint, { params }),
  delete: (endpoint: Endpoint, params?: Object) => axiosInstance.delete(endpoint, { params }),
  head: (endpoint: Endpoint, params?: Object) => axiosInstance.head(endpoint, { params }),
  post: (endpoint: Endpoint, body?: Object, params?: Object) => (
    axiosInstance.post(endpoint, body, { params })
  ),
  put: (endpoint: Endpoint, body?: Object, params?: Object) => (
    axiosInstance.put(endpoint, body, { params })
  ),
  saveAuthToken: (token: string) => {
    authorizationToken = token;
  },
  getAuthToken: (): string => {
    return authorizationToken;
  },
  registerInterceptor: (onSuccess: Function, onError: Function) => {
    axiosInstance.interceptors.response.use(onSuccess, onError);
  },
};

console.log(baseURL);
export default api;
