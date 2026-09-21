import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

const WINDOW_MS = 24 * 60 * 60 * 1000;
const SESSION_MS = 30 * 60 * 1000;
const PAGE_SIZE = 1000;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const SOCIAL_PREVIEW_CAP = 2;
const CRAWLER_CAP = 1;

const IT_INDEX_SLUGS = new Set([
  'c',
  'jlpt',
  'serie',
  'piu-consultati',
]);

const EN_INDEX_SLUGS = new Set([
  'c',
  'jlpt',
  'series',
]);

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=300',
    },
    body: JSON.stringify(body),
  };
}

function normalizeArticlePath(value) {
  if (typeof value !== 'string') return null;

  let pathname;

  try {
    pathname = new URL(
      value,
      'https://hakkirinihongo.com'
    ).pathname;
  } catch {
    return null;
  }

  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  const italianMatch = pathname.match(
    /^\/articoli\/([^/]+)\/$/
  );

  if (
    italianMatch &&
    !IT_INDEX_SLUGS.has(italianMatch[1])
  ) {
    return {
      path: pathname,
      language: 'it',
    };
  }

  const englishMatch = pathname.match(
    /^\/en\/articles\/([^/]+)\/$/
  );

  if (
    englishMatch &&
    !EN_INDEX_SLUGS.has(englishMatch[1])
  ) {
    return {
      path: pathname,
      language: 'en',
    };
  }

  return null;
}

function getRequestedLanguage(event) {
  const language = event.queryStringParameters?.lang;

  return language === 'it' || language === 'en'
    ? language
    : null;
}

function getRequestedLimit(event) {
  const raw = Number.parseInt(
    event.queryStringParameters?.limit || '',
    10
  );

  if (!Number.isFinite(raw)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(raw, 1), MAX_LIMIT);
}

function timeValue(value) {
  const parsed = new Date(value).getTime();

  return Number.isFinite(parsed) ? parsed : 0;
}

function actorKey(row) {
  return (
    row.visitor_hash ||
    row.created_at ||
    row.activated_at ||
    'unknown'
  );
}

function createArticleState(article) {
  return {
    path: article.path,
    language: article.language,
    humanLastSeen: new Map(),
    humanCount: 0,
    aiCount: 0,
    socialActors: new Set(),
    prefetchLastSeen: new Map(),
    prefetchCount: 0,
    crawlerSeen: false,
    lastActivity: 0,
  };
}

function getArticleState(states, article) {
  if (!states.has(article.path)) {
    states.set(
      article.path,
      createArticleState(article)
    );
  }

  return states.get(article.path);
}

function updateLastActivity(state, value) {
  state.lastActivity = Math.max(
    state.lastActivity,
    timeValue(value)
  );
}

function registerSession(
  state,
  lastSeenKey,
  countKey,
  row,
  timeColumn
) {
  const actor = actorKey(row);
  const timestamp = timeValue(row[timeColumn]);
  const previous = state[lastSeenKey].get(actor);

  if (!previous || timestamp - previous >= SESSION_MS) {
    state[countKey] += 1;
  }

  state[lastSeenKey].set(actor, timestamp);
}

async function fetchAllRows(
  table,
  columns,
  timeColumn,
  cutoff
) {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .gte(timeColumn, cutoff)
      .order(timeColumn, {
        ascending: true,
      })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data || [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
  }

  return rows;
}

function processTrafficEvents(states, rows) {
  for (const row of rows) {
    const article = normalizeArticlePath(row.path);

    if (!article) continue;

    const state = getArticleState(states, article);

    const isBrowserAccess =
      row.classification === 'human_likely' ||
      (
        row.classification === 'unknown' &&
        row.reason ===
          'Browser category without independent human signal'
      );

    if (isBrowserAccess) {
      registerSession(
        state,
        'humanLastSeen',
        'humanCount',
        row,
        'created_at'
      );

      updateLastActivity(state, row.created_at);
      continue;
    }

    if (row.classification === 'ai_agent') {
      state.aiCount += 1;
      updateLastActivity(state, row.created_at);
      continue;
    }

    if (row.classification === 'social_preview') {
      state.socialActors.add(actorKey(row));
      updateLastActivity(state, row.created_at);
      continue;
    }

    if (row.classification === 'crawler') {
      state.crawlerSeen = true;
      updateLastActivity(state, row.created_at);
    }
  }
}

function processActivatedPrefetches(states, rows) {
  for (const row of rows) {
    const article = normalizeArticlePath(row.path);

    if (!article) continue;

    const state = getArticleState(states, article);

    registerSession(
      state,
      'prefetchLastSeen',
      'prefetchCount',
      row,
      'activated_at'
    );

    updateLastActivity(state, row.activated_at);
  }
}

function buildRanking(states, language, limit) {
  return Array.from(states.values())
    .filter(
      (state) =>
        !language || state.language === language
    )
    .map((state) => {
      const accesses =
        state.humanCount +
        state.aiCount +
        Math.min(
          state.socialActors.size,
          SOCIAL_PREVIEW_CAP
        ) +
        state.prefetchCount +
        (state.crawlerSeen ? CRAWLER_CAP : 0);

      return {
        path: state.path,
        accesses,
        last_activity: state.lastActivity
          ? new Date(state.lastActivity).toISOString()
          : null,
      };
    })
    .filter((article) => article.accesses > 0)
    .sort((a, b) => {
      if (b.accesses !== a.accesses) {
        return b.accesses - a.accesses;
      }

      return (
        timeValue(b.last_activity) -
        timeValue(a.last_activity)
      );
    })
    .slice(0, limit)
    .map((article) => ({
      path: article.path,
    }));
}

export const handler = async (event) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return json(500, {
        error: 'Missing server configuration.',
      });
    }

    if (event.httpMethod !== 'GET') {
      return json(405, {
        error: 'Method not allowed.',
      });
    }

    const language = getRequestedLanguage(event);
    const limit = getRequestedLimit(event);
    const cutoff = new Date(
      Date.now() - WINDOW_MS
    ).toISOString();

    const [trafficEvents, activatedPrefetches] =
      await Promise.all([
        fetchAllRows(
          'traffic_events',
          'created_at,path,visitor_hash,classification,reason',
          'created_at',
          cutoff
        ),
        fetchAllRows(
          'traffic_prefetch_activations',
          'activated_at,path,visitor_hash',
          'activated_at',
          cutoff
        ),
      ]);

    const states = new Map();

    processTrafficEvents(states, trafficEvents);
    processActivatedPrefetches(
      states,
      activatedPrefetches
    );

    return json(200, {
      generated_at: new Date().toISOString(),
      window_hours: 24,
      articles: buildRanking(
        states,
        language,
        limit
      ),
    });
  } catch (error) {
    console.error('Popular articles error:', error);

    return json(500, {
      error: 'Unexpected server error.',
    });
  }
};