function getLanguage(pathname) {
  if (pathname === "/en/" || pathname.startsWith("/en/")) return "en";

  if (
    pathname === "/" ||
    pathname.startsWith("/articoli/") ||
    pathname.startsWith("/esercizi/") ||
    pathname === "/cerca/" ||
    pathname === "/chi-siamo/" ||
    pathname === "/chi-siamo-metodo/" ||
    pathname === "/contatti/" ||
    pathname === "/prossimi-articoli/" ||
    pathname === "/sfoglia-articoli/"
  ) {
    return "it";
  }

  return "other";
}

function normalizeHost(hostname) {
  return (hostname || "").toLowerCase().replace(/^www\./, "");
}

function getReferrer(request, currentUrl) {
  const raw = request.headers.get("referer");

  if (!raw) {
    return { source: "direct", host: null, path: null };
  }

  try {
    const ref = new URL(raw);
    const refHost = normalizeHost(ref.hostname);
    const currentHost = normalizeHost(currentUrl.hostname);

    if (refHost === currentHost) {
      return {
        source: "internal",
        host: refHost,
        path: ref.pathname,
      };
    }

    let source = refHost || "unknown";

    if (
      refHost === "google.com" ||
      refHost.startsWith("google.") ||
      refHost.endsWith(".google.com")
    ) {
      source = "google";
    } else if (
      refHost === "bing.com" ||
      refHost.endsWith(".bing.com")
    ) {
      source = "bing";
    } else if (
      refHost === "duckduckgo.com" ||
      refHost.endsWith(".duckduckgo.com")
    ) {
      source = "duckduckgo";
    } else if (
      refHost === "kagi.com" ||
      refHost.endsWith(".kagi.com")
    ) {
      source = "kagi";
    } else if (
      refHost === "reddit.com" ||
      refHost.endsWith(".reddit.com") ||
      refHost === "com.reddit.frontpage"
    ) {
      source = "reddit";
    } else if (
      refHost === "facebook.com" ||
      refHost.endsWith(".facebook.com")
    ) {
      source = "facebook";
    } else if (
      refHost === "instagram.com" ||
      refHost.endsWith(".instagram.com")
    ) {
      source = "instagram";
    }

    return {
      source,
      host: refHost || null,
      path: ref.pathname || null,
    };
  } catch {
    return {
      source: "unknown",
      host: null,
      path: null,
    };
  }
}

function getBrowserFamily(userAgent) {
  const ua = userAgent || "";

  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/CriOS\//i.test(ua)) return "Chrome iOS";
  if (/FxiOS\//i.test(ua)) return "Firefox iOS";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Chrome\//i.test(ua)) return "Chrome";

  if (/Safari\//i.test(ua) && /Version\//i.test(ua)) {
    return "Safari";
  }

  return "Other";
}

function getDeviceType(userAgent) {
  const ua = userAgent || "";

  if (/iPad|Tablet/i.test(ua)) return "tablet";

  if (/iPhone|Android.*Mobile|Mobile/i.test(ua)) {
    return "mobile";
  }

  if (/Android/i.test(ua)) return "tablet";

  if (/Windows|Macintosh|Linux|X11/i.test(ua)) {
    return "desktop";
  }

  return "unknown";
}

function classifyRequest(request, source) {
  const userAgent =
    request.headers.get("user-agent") || "";

  const rawCategory =
    request.headers.get("netlify-agent-category") || "";

  const category =
    rawCategory.split(";")[0].trim().toLowerCase();

  const secPurpose =
    request.headers.get("sec-purpose") || "";

  const purpose =
    request.headers.get("purpose") || "";

  if (
    secPurpose.toLowerCase().includes("prefetch") ||
    purpose.toLowerCase().includes("prefetch")
  ) {
    return {
      classification: "prefetch",
      confidence: 99,
      reason: "Browser prefetch header detected",
    };
  }

  if (category === "page-preview") {
    return {
      classification: "social_preview",
      confidence: 99,
      reason: `Netlify agent category: ${rawCategory}`,
    };
  }

  if (category === "crawler") {
    return {
      classification: "crawler",
      confidence: 99,
      reason: `Netlify agent category: ${rawCategory}`,
    };
  }

  if (category === "ai-agent") {
    return {
      classification: "ai_agent",
      confidence: 98,
      reason: `Netlify agent category: ${rawCategory}`,
    };
  }

  if (category === "tooling") {
    return {
      classification: "unknown",
      confidence: 20,
      reason: `Automated tooling: ${rawCategory}`,
    };
  }

  if (category === "none") {
    return {
      classification: "unknown",
      confidence: 15,
      reason: "No User-Agent supplied",
    };
  }

  if (
    /facebookexternalhit|Twitterbot|Slackbot|Discordbot|WhatsApp/i.test(
      userAgent
    )
  ) {
    return {
      classification: "social_preview",
      confidence: 98,
      reason: "Known link-preview User-Agent",
    };
  }

  if (
    /Googlebot|Bingbot|DuckDuckBot|SerpstatBot|GPTBot|ClaudeBot|crawler|spider|bot\b/i.test(
      userAgent
    )
  ) {
    return {
      classification: "crawler",
      confidence: 97,
      reason: "Known crawler/bot User-Agent",
    };
  }

  if (
    /ChatGPT-User|Claude-User|Perplexity-User|DuckAssistBot/i.test(
      userAgent
    )
  ) {
    return {
      classification: "ai_agent",
      confidence: 95,
      reason: "Known on-demand AI User-Agent",
    };
  }

  if (category === "browser") {
    const searchSources = [
      "google",
      "bing",
      "duckduckgo",
      "kagi",
    ];

    const fromSearch =
      searchSources.includes(source);

    if (fromSearch) {
      return {
        classification: "human_likely",
        confidence: 84,
        reason: "Normal browser with search-engine referrer",
      };
    }

    return {
      classification: "unknown",
      confidence: 45,
      reason: "Browser category without independent human signal",
    };
  }

  if (
    /Chrome|Safari|Firefox|Edg|OPR|CriOS|FxiOS/i.test(
      userAgent
    )
  ) {
    return {
      classification: "unknown",
      confidence: 30,
      reason:
        "Browser-like User-Agent, not confirmed by Netlify category",
    };
  }

  return {
    classification: "unknown",
    confidence: 40,
    reason: rawCategory
      ? `Netlify agent category: ${rawCategory}`
      : "Insufficient evidence",
  };
}

async function makeVisitorHash(
  ip,
  userAgent,
  secret
) {
  const today =
    new Date().toISOString().slice(0, 10);

  const input =
    `${today}|${ip}|${userAgent}`;

  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(input)
    );

  return Array.from(
    new Uint8Array(signature)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

async function saveTrafficEvent(
  request,
  context
) {
  try {
    const supabaseUrl =
      Netlify.env.get("SUPABASE_URL");

    const supabaseKey =
      Netlify.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    const trafficSecret =
      Netlify.env.get(
        "TRAFFIC_HASH_SECRET"
      );

    if (
      !supabaseUrl ||
      !supabaseKey ||
      !trafficSecret
    ) {
      console.error(
        "Traffic observer: missing environment variables."
      );
      return;
    }

    const url =
      new URL(request.url);

    const userAgent =
      request.headers.get("user-agent") || "";

    const referrer =
      getReferrer(request, url);

    const classification =
      classifyRequest(
        request,
        referrer.source
      );

    const visitorHash =
      await makeVisitorHash(
        context.ip || "unknown",
        userAgent,
        trafficSecret
      );

    const event = {
      request_id: context.requestId,

      path: url.pathname,

      language:
        getLanguage(url.pathname),

      source:
        referrer.source,

      referrer_host:
        referrer.host,

      referrer_path:
        referrer.path,

      country_code:
        context.geo?.country?.code || null,

      visitor_hash:
        visitorHash,

      classification:
        classification.classification,

      confidence:
        classification.confidence,

      reason:
        classification.reason,

      browser_family:
        getBrowserFamily(userAgent),

      device_type:
        getDeviceType(userAgent),
    };

    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/traffic_events`,
        {
          method: "POST",

          headers: {
            apikey: supabaseKey,

            Authorization:
              `Bearer ${supabaseKey}`,

            "Content-Type":
              "application/json",

            Prefer:
              "return=minimal",
          },

          body:
            JSON.stringify(event),
        }
      );

    if (!response.ok) {
      const message =
        await response.text();

      console.error(
        "Traffic observer: Supabase insert failed:",
        response.status,
        message
      );
    }
  } catch (error) {
    console.error(
      "Traffic observer error:",
      error
    );
  }
}

export default async function trafficObserver(
  request,
  context
) {
  const response = await context.next({
    sendConditionalRequest: true,
  });

  const contentType =
    response.headers.get("content-type") || "";

  if (
    response.status === 200 &&
    contentType.toLowerCase().includes("text/html")
  ) {
    context.waitUntil(
      saveTrafficEvent(request, context)
    );
  }

  return response;
}

export const config = {
  path: [
    "/",

    "/articoli/",
    "/articoli/*",

    "/cerca/",
    "/chi-siamo/",
    "/chi-siamo-metodo/",
    "/contatti/",

    "/esercizi/",
    "/esercizi/*",

    "/prossimi-articoli/",
    "/sfoglia-articoli/",

    "/en/",
    "/en/*",
  ],

  method: "GET",

  onError: "bypass",
};
