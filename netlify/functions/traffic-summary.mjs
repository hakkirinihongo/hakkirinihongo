import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dashboardSecret = process.env.TRAFFIC_DASHBOARD_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function secretsMatch(received, expected) {
  if (
    typeof received !== 'string' ||
    typeof expected !== 'string'
  ) {
    return false;
  }

  const a = Buffer.from(received);
  const b = Buffer.from(expected);

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

export const handler = async (event) => {
  try {
    if (
      !supabaseUrl ||
      !supabaseKey ||
      !dashboardSecret
    ) {
      return json(500, {
        error: 'Missing server configuration.',
      });
    }

    if (event.httpMethod !== 'POST') {
      return json(405, {
        error: 'Method not allowed.',
      });
    }

    let payload;

    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return json(400, {
        error: 'Invalid JSON body.',
      });
    }

    if (
      !secretsMatch(
        payload.secret,
        dashboardSecret
      )
    ) {
      return json(401, {
        error: 'Unauthorized.',
      });
    }

    const { data, error } = await supabase
      .from('traffic_daily_summary')
      .select('*')
      .order('giorno', {
        ascending: false,
      })
      .limit(30);

    if (error) {
      throw error;
    }

    const {
      data: events,
      error: eventsError,
    } = await supabase
      .from('traffic_event_status')
      .select(
        'created_at,path,source,country_code,stato_finale,confidence,browser_family,device_type'
      )
      .order('created_at', {
        ascending: false,
      })
      .limit(100);

    if (eventsError) {
      throw eventsError;
    }

    return json(200, {
      days: data ?? [],
      events: events ?? [],
    });
  } catch (error) {
    console.error(
      'Traffic summary error:',
      error
    );

    return json(500, {
      error: 'Unexpected server error.',
    });
  }
};
