// functions/create-checkout.js
//
// Cloudflare Pages Function for Stripe Checkout.
//
// Cloudflare Pages Functions use a different format to Netlify Functions:
// - They export an onRequest handler (not exports.handler)
// - Environment variables are on context.env (not process.env)
// - They receive a Request object and return a Response object
//
// Required environment variable (set in Cloudflare Pages dashboard):
//   STRIPE_SECRET_KEY = sk_live_xxxxxxxxxxxxx

export async function onRequestPost(context) {
  // Only reachable via POST due to onRequestPost — but guard anyway
  const env = context.env;

  // Fail clearly if the secret key hasn't been configured
  if (!env.STRIPE_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: STRIPE_SECRET_KEY is not set." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Call the Stripe API directly using fetch (no npm needed in Cloudflare)
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "subscription",
        "line_items[0][price]": "price_1Tjxq4RmhksaGNYe7ZhvPz47",
        "line_items[0][quantity]": "1",
        success_url: "https://legalshield-ai.netlify.app?success=true",
        cancel_url: "https://legalshield-ai.netlify.app?canceled=true",
      }),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe error:", session.error?.message);
      return new Response(
        JSON.stringify({ error: "Unable to create checkout session." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Checkout error:", err.message);
    return new Response(
      JSON.stringify({ error: "Unable to create checkout session." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
