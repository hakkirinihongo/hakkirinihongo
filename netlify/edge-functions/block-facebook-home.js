
export default function (request) {
  const userAgent = request.headers.get("user-agent") || "";

  const isFacebook = /facebookexternalhit/i.test(userAgent);

  // Firma conosciuta delle anteprime iMessage di Apple.
  const isIMessagePreview =
    /facebookexternalhit\/1\.1\s+Facebot\s+Twitterbot\/1\.0\b/i.test(userAgent);

  // Consenti i browser normali e le anteprime iMessage.
  if (!isFacebook || isIMessagePreview) {
    return;
  }

  // Blocca le altre richieste facebookexternalhit.
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
