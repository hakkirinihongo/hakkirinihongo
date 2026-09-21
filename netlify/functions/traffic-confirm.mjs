import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const trafficSecret = process.env.TRAFFIC_HASH_SECRET;

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

function makeVisitorHash(
  ip,
  userAgent,
  secret
) {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  return crypto
    .createHmac('sha256', secret)
    .update(
      `${today}|${ip}|${userAgent}`
    )
    .digest('hex');
}

function cleanPath(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const path = value.trim();

  if (!path.startsWith('/')) {
    return null;
  }

  if (path.length > 500) {
    return null;
  }

  return path;
}

export default async function trafficConfirm(
  request,
  context
) {
  try {
    if (request.method !== 'POST') {
      return new Response(null, {
        status: 405,
      });
    }

    if (
      !supabaseUrl ||
      !supabaseKey ||
      !trafficSecret
    ) {
      console.error(
        'Traffic confirm: missing server configuration.'
      );

      return new Response(null, {
        status: 500,
      });
    }

    let payload;

    try {
      payload = await request.json();
    } catch {
      return new Response(null, {
        status: 400,
      });
    }

    const path =
      cleanPath(payload?.path);

    if (!path) {
      return new Response(null, {
        status: 400,
      });
    }

    const userAgent =
      request.headers.get(
        'user-agent'
      ) || '';

    const visitorHash =
      makeVisitorHash(
        context.ip || 'unknown',
        userAgent,
        trafficSecret
      );

    const tenMinutesAgo =
      new Date(
        Date.now() - 10 * 60 * 1000
      ).toISOString();

    const {
      data: event,
      error: findError,
    } = await supabase
      .from('traffic_events')
      .select(
        'id,classification,reason,browser_confirmed'
      )
      .eq(
        'visitor_hash',
        visitorHash
      )
      .eq(
        'path',
        path
      )
      .gte(
        'created_at',
        tenMinutesAgo
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!event) {
      return new Response(null, {
        status: 204,
      });
    }

    if (
      event.classification ===
        'prefetch'
    ) {
      const {
        error: activationError,
      } = await supabase
        .from(
          'traffic_prefetch_activations'
        )
        .upsert(
          {
            event_id:
              String(event.id),
            path,
            visitor_hash:
              visitorHash,
            activated_at:
              new Date().toISOString(),
          },
          {
            onConflict: 'event_id',
            ignoreDuplicates: true,
          }
        );

      if (activationError) {
        throw activationError;
      }

      return new Response(null, {
        status: 204,
      });
    }

    const confirmable =
      (
        event.classification ===
          'unknown' &&
        event.reason ===
          'Browser category without independent human signal'
      )
      ||
      (
        event.classification ===
          'human_likely' &&
        event.reason ===
          'Normal browser with search-engine referrer'
      );

    if (!confirmable) {
      return new Response(null, {
        status: 204,
      });
    }

    if (!event.browser_confirmed) {
      const {
        error: updateError,
      } = await supabase
        .from('traffic_events')
        .update({
          browser_confirmed: true,
          browser_confirmed_at:
            new Date().toISOString(),
        })
        .eq(
          'id',
          event.id
        );

      if (updateError) {
        throw updateError;
      }
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error(
      'Traffic confirm error:',
      error
    );

    return new Response(null, {
      status: 500,
    });
  }
}