/* @flow */

import axios from 'axios';
import type { Endpoint } from './endpoint';
import { baseURL } from './endpoint'; // eslint-disable-line

const axiosInstance = axios.create({
  baseURL,
});

const api = {
  get: (endpoint: Endpoint, params?: Object) => axiosInstance.get(endpoint, { params }),
  delete: (endpoint: Endpoint, params?: Object) => axiosInstance.delete(endpoint, { params }),
  head: (endpoint: Endpoint, params?: Object) => axiosInstance.head(endpoint, { params }),
  post: (endpoint: Endpoint, body?: Object, params?: Object) => (
    axiosInstance.get(endpoint, body, { params })
  ),
  put: (endpoint: Endpoint, body?: Object, params?: Object) => (
    axiosInstance.put(endpoint, body, { params })
  ),
};
console.log(baseURL);

export default api;
