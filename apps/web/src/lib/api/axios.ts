import { env } from '@zol-track/env/web';
import axios from 'axios'


const apiClient = axios.create({
  baseURL: env + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;