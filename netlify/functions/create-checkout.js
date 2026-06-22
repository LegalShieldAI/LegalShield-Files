const Stripe = require("stripe");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Use POST." }),
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server misconfiguration: STRIPE_SECRET_KEY is not set.",
      }),
    };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: "price_1Tjxq4RmhksaGNYe7ZhvPz47",
          quantity: 1,
        },
      ],
      success_url: "https://legalshield-ai.netlify.app?success=true",
      cancel_url: "https://legalshield-ai.netlify.app?canceled=true",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe Checkout Session creation failed:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unable to create checkout session." }),
    };
  }
};
