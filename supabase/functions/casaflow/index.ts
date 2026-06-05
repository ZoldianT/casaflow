const STORAGE_BASE =
  "https://xidcnbkfurlgujejutus.supabase.co/storage/v1/object/public/casaflow-app";

const TYPES: Record<string, string> = {
  "index.html": "text/html; charset=utf-8",
  "style.css": "text/css; charset=utf-8",
  "app.js": "application/javascript; charset=utf-8",
  "config.js": "application/javascript; charset=utf-8"
};

Deno.serve(async (request) => {
  const url = new URL(request.url);
  if (url.searchParams.has("html-test")) {
    return new Response("<!doctype html><title>CasaFlow test</title><h1>CasaFlow test</h1>", {
      headers: new Headers([["content-type", "text/html; charset=utf-8"]])
    });
  }
  const last = url.pathname.split("/").filter(Boolean).at(-1) || "index.html";
  const fileName = TYPES[last] ? last : "index.html";
  const response = await fetch(`${STORAGE_BASE}/${fileName}`);

  if (!response.ok) {
    return new Response("CasaFlow non e' disponibile.", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  let body = await response.text();
  if (fileName === "index.html") {
    body = body
      .replace('href="style.css"', 'href="./casaflow/style.css"')
      .replace('src="config.js"', 'src="./casaflow/config.js"')
      .replace('src="app.js"', 'src="./casaflow/app.js"');
  }

  return new Response(body, {
    headers: {
      "Content-Type": TYPES[fileName],
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    }
  });
});
