// functions/aichat.js
// Cloudflare Pages Function — proxies requests to the Anthropic API.
// Required env var: ANTHROPIC_API_KEY

export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Log key length to verify it was read correctly (never log the full key)
  console.log('API key length:', apiKey.length, '| starts with:', apiKey.slice(0, 10));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: body.model || 'claude-sonnet-4-6',
      max_tokens: body.max_tokens || 1000,
      messages: body.messages,
    }),
  });

  const data = await response.json();

  // Return full Anthropic response including any error details
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
