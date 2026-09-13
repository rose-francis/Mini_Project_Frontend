import { SUPABASE_URL, SUPABASE_KEY, BACKEND_URL as ENV_BACKEND_URL } from '@env';

export const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;

export const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export const BACKEND_URL = ENV_BACKEND_URL;
