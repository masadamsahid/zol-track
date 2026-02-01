import { env } from '@zol-track/env/web';
import axios from 'axios'
import { authClient } from '../auth-client';


const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_SERVER_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;