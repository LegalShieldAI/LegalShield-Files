// functions/ai-chat.js
// Cloudflare Pages Function — proxies requests to the Anthropic API.
// The API key lives here server-side and never reaches the browser.
//
// Required environment variable (set in Cloudflare Pages dashboard):
//   ANTHROPIC_API_KEY = sk-ant-...

export async function onRequestPost(context) {
  const env = context.env;

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: ANTHROPIC_API_KEY is not set.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-6',
        max_tokens: body.max_tokens || 1000,
        messages: body.messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return new Response(
        JSON.stringify({ error: 'Anthropic API error.', detail: data }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Proxy error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Failed to reach Anthropic API.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
