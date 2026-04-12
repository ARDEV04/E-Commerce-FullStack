const base =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function createPayPalOrder(
  items: { name: string; unit_amount: number; quantity: number }[],
  total: number,
  currency: string = "USD"
) {
  const token = await getAccessToken();

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: items
                .reduce((s, i) => s + i.unit_amount * i.quantity, 0)
                .toFixed(2),
            },
          },
        },
        items: items.map((i) => ({
          name: i.name,
          unit_amount: {
            currency_code: currency,
            value: i.unit_amount.toFixed(2),
          },
          quantity: String(i.quantity),
        })),
      },
    ],
  };

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await res.json();
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return await res.json();
}
