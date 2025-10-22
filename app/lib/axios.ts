import axios from 'axios';

import { BASE_URL } from './api';

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
  if (globalEmployeeId) {
    config.headers['userId'] = globalEmployeeId;
  }
  return config;
});
