import dotenv from 'dotenv';
import { Log } from 'logging_middleware'; 
import type { Notification } from '../types/types.js';
import { getTopNotifications } from '../utils/priorityFilter.js';

dotenv.config({ path: '../.env' });

const TEST_SERVER = process.env.TEST_SERVER || 'http://4.224.186.213/evaluation-service';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    Log('backend', 'info', 'service', 'Fetching notifications from test server');
    
    const res = await fetch(`${TEST_SERVER}/notifications`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json() as { notifications: Notification[] };
    return data.notifications;
  } catch (err) {
    Log('backend', 'error', 'service', `Failed to fetch notifications: ${err}`);
    throw err;
  }
}

export { getTopNotifications };