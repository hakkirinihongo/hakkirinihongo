import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ratingSalt = process.env.RATING_SALT;

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

function cleanArticleKey(value) {
  if (typeof value !== 'string') return null;

  const cleaned = value.trim();

  if (!cleaned) return null;
  if (cleaned.length > 220) return null;

  return cleaned;
}

function cleanRating(value) {
  const rating = Number(value);

  if (!Number.isInteger(rating)) return null;
  if (rating < 1 || rating > 10) return null;

  return rating;
}

function cleanClientId(value) {
  if (typeof value !== 'string') return null;

  const cleaned = value.trim();

  if (!cleaned) return null;
  if (cleaned.length < 8 || cleaned.length > 120) return null;

  return cleaned;
}

function makeVisitorHash(articleKey, clientId) {
  return crypto
    .createHash('sha256')
    .update(`${ratingSalt}:${articleKey}:${clientId}`)
    .digest('hex');
}

async function getSummary(articleKey) {
  const { data, error } = await supabase
    .from('article_rating_summary')
    .select('average_rating, vote_count')
    .eq('article_key', articleKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    averageRating:
      data?.average_rating === null || data?.average_rating === undefined
        ? null
        : Number(data.average_rating),
    voteCount: data?.vote_count ?? 0,
  };
}

export const handler = async (event) => {
  try {
    if (!supabaseUrl || !supabaseKey || !ratingSalt) {
      return json(500, {
        error: 'Missing server configuration.',
      });
    }

    if (event.httpMethod === 'GET') {
      const articleKey = cleanArticleKey(
        event.queryStringParameters?.articleKey
      );

      if (!articleKey) {
        return json(400, {
          error: 'Missing or invalid articleKey.',
        });
      }

      const summary = await getSummary(articleKey);

      return json(200, summary);
    }

    if (event.httpMethod === 'POST') {
      let payload;

      try {
        payload = JSON.parse(event.body || '{}');
      } catch {
        return json(400, {
          error: 'Invalid JSON body.',
        });
      }

      const articleKey = cleanArticleKey(payload.articleKey);
      const rating = cleanRating(payload.rating);
      const clientId = cleanClientId(payload.clientId);

      if (!articleKey || !rating || !clientId) {
        return json(400, {
          error: 'Invalid rating payload.',
        });
      }

      const visitorHash = makeVisitorHash(articleKey, clientId);

      const { error } = await supabase
        .from('article_ratings')
        .upsert(
          {
            article_key: articleKey,
            rating,
            visitor_hash: visitorHash,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'article_key,visitor_hash',
          }
        );

      if (error) {
        throw error;
      }

      const summary = await getSummary(articleKey);

      return json(200, {
        ...summary,
        userRating: rating,
      });
    }

    return json(405, {
      error: 'Method not allowed.',
    });
  } catch (error) {
    console.error(error);

    return json(500, {
      error: 'Unexpected server error.',
    });
  }
};
