
export default function (request) {
  const userAgent = request.headers.get("user-agent") || "";

  if (!/facebookexternalhit/i.test(userAgent)) {
    return;
  }

  return new Response("Forbidden", {
    status: 403,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export const config = {
  path: "/",
  method: "GET",
  header: {
    "user-agent": "facebookexternalhit"
  },
  onError: "bypass"
};
