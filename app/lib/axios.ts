import axios, { AxiosHeaders } from 'axios';

import { BASE_URL } from './api';
import { getAuthToken } from './utils';

// 글로벌 employeeId 저장소
let globalEmployeeId: string | null = null;

export function setAxiosGlobalEmployeeId(employeeId: string) {
  globalEmployeeId = employeeId;
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers);
  }

  const token = getAuthToken();
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  if (globalEmployeeId && !config.headers.has('userId')) {
    config.headers.set('userId', globalEmployeeId);
  }

  // 필요 시 Content-Type 보장
  if (!config.headers.has('Content-Type')) {
    config.headers.set('Content-Type', 'application/json');
  }
  return config;
});
