const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// For testing without a domain: use 'onboarding@resend.dev'
// — emails will only deliver to your Resend account email, not real customers
// For production: verify your domain in Resend → use 'orders@yourdomain.com'
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Black Crème <onboarding@resend.dev>';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order } = await req.json();

    if (!order?.customer_email) {
      return new Response(
        JSON.stringify({ error: 'Missing order or customer_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');

    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString('en-MY', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

    const deliveryLine = order.delivery_type === 'pickup'
      ? '🏪 Self Pickup (Free)'
      : [
          order.delivery_address_line_1,
          order.delivery_address_line_2,
          `${order.delivery_postcode ?? ''} ${order.delivery_city ?? ''}`.trim(),
          order.delivery_state,
        ].filter(Boolean).join(', ');

    const itemRows = (order.order_items ?? [])
      .map((item: { product_name: string; quantity: number; subtotal: number }) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;color:#3d2b1f;font-size:14px;">
            ${item.product_name}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;text-align:center;color:#7a6355;font-size:14px;">
            ×${item.quantity}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;text-align:right;color:#3d2b1f;font-size:14px;font-weight:600;">
            RM ${Number(item.subtotal).toFixed(2)}
          </td>
        </tr>
      `).join('');

    const orderRef = order.order_number ?? order.id.substring(0, 8).toUpperCase();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmed — Black Crème</title>
  <link href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap" rel="stylesheet">
  <style>@import url('https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <div style="max-width:580px;margin:40px auto 60px;padding:0 16px;">

    <!-- Card -->
    <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#1a0f0a;padding:36px 40px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:5px;text-transform:uppercase;color:#c9956a;opacity:0.7;">Handcrafted Desserts</p>
        <h1 style="margin:0;font-size:36px;color:#c9956a;font-weight:400;font-family:'Berkshire Swash',cursive;letter-spacing:0;">Black Crème</h1>
        <p style="margin:12px 0 0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#ffffff;opacity:0.4;">Order Confirmed</p>
      </div>

      <!-- Body -->
      <div style="padding:36px 40px;">

        <p style="margin:0 0 6px;font-size:16px;color:#3d2b1f;font-weight:600;">Hi ${order.customer_name} 👋</p>
        <p style="margin:0 0 28px;font-size:14px;color:#7a6355;line-height:1.6;">
          Thank you for your order! We've received your payment and will start preparing your cake.
          You'll hear from us if we need anything before your delivery.
        </p>

        <!-- Order Summary Box -->
        <div style="background:#faf7f2;border-radius:12px;padding:20px;margin-bottom:28px;">
          <table style="width:100%;font-size:13px;border-collapse:collapse;">
            <tr>
              <td style="padding:5px 0;color:#7a6355;">Order Ref</td>
              <td style="padding:5px 0;color:#1a0f0a;font-weight:700;text-align:right;font-size:14px;">${orderRef}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#7a6355;">Scheduled</td>
              <td style="padding:5px 0;color:#3d2b1f;text-align:right;">
                ${formatDate(order.scheduled_date)}${order.scheduled_time ? ` &middot; ${order.scheduled_time}` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#7a6355;vertical-align:top;">Delivery</td>
              <td style="padding:5px 0;color:#3d2b1f;text-align:right;max-width:260px;">${deliveryLine}</td>
            </tr>
            ${order.cake_message ? `
            <tr>
              <td style="padding:5px 0;color:#7a6355;">Cake Message</td>
              <td style="padding:5px 0;color:#c9956a;font-style:italic;text-align:right;">"${order.cake_message}"</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Items -->
        <h3 style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#7a6355;">Your Order</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${itemRows}
          <tr>
            <td colspan="2" style="padding:12px 0 6px;color:#7a6355;font-size:13px;">Subtotal</td>
            <td style="padding:12px 0 6px;text-align:right;color:#7a6355;font-size:13px;">
              RM ${Number(order.subtotal).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 0;color:#7a6355;font-size:13px;">Delivery Fee</td>
            <td style="padding:4px 0;text-align:right;color:#7a6355;font-size:13px;">
              ${Number(order.delivery_fee) === 0 ? 'Free' : `RM ${Number(order.delivery_fee).toFixed(2)}`}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:14px 0 0;font-size:16px;font-weight:700;color:#1a0f0a;border-top:2px solid #f0ebe3;">
              Total Paid
            </td>
            <td style="padding:14px 0 0;text-align:right;font-size:20px;font-weight:700;color:#c9956a;border-top:2px solid #f0ebe3;">
              RM ${Number(order.total).toFixed(2)}
            </td>
          </tr>
        </table>

      </div>

      <!-- Footer -->
      <div style="background:#faf7f2;border-top:1px solid #f0ebe3;padding:24px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;color:#7a6355;">
          Questions about your order? Message us on
          <a href="https://wa.me/60123456789" style="color:#c9956a;text-decoration:none;font-weight:600;">WhatsApp</a>
        </p>
        <p style="margin:0;font-size:11px;color:#b0a090;letter-spacing:2px;text-transform:uppercase;">
          © 2026 Black Crème &middot; Handcrafted with Indulgence
        </p>
      </div>

    </div>
  </div>

</body>
</html>`;

    // Send customer confirmation email
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [order.customer_email],
        subject: `Order Confirmed — ${orderRef} · Black Crème`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error: ${errText}`);
    }

    // Send admin notification email
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    if (adminEmail) {
      const fullAddress = order.delivery_type === 'pickup'
        ? '🏪 Self Pickup'
        : [
            order.delivery_address_line_1,
            order.delivery_address_line_2,
            `${order.delivery_postcode ?? ''} ${order.delivery_city ?? ''}`.trim(),
            order.delivery_state,
          ].filter(Boolean).join(', ');

      const adminItemRows = (order.order_items ?? [])
        .map((item: { product_name: string; quantity: number; subtotal: number }) =>
          `<tr>
            <td style="padding:6px 0;border-bottom:1px solid #eee;font-size:14px;">${item.product_name}</td>
            <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:center;font-size:14px;">×${item.quantity}</td>
            <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;font-weight:600;">RM ${Number(item.subtotal).toFixed(2)}</td>
          </tr>`
        ).join('');

      const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap" rel="stylesheet">
  <style>@import url('https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <div style="background:#1a0f0a;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <p style="margin:0;color:#c9956a;font-size:11px;letter-spacing:3px;text-transform:uppercase;">New Order</p>
        <h1 style="margin:4px 0 0;color:#ffffff;font-size:22px;font-family:'Berkshire Swash',cursive;font-weight:400;">Black Crème</h1>
      </div>
      <div style="background:#c9956a;color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:700;">
        ${orderRef}
      </div>
    </div>

    <div style="padding:24px 28px;background:#fff8f2;border-bottom:1px solid #eee;">
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;color:#888;width:40%;">Customer</td>
          <td style="padding:4px 0;font-weight:600;color:#1a0f0a;">${order.customer_name ?? '—'}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Phone</td>
          <td style="padding:4px 0;color:#1a0f0a;">${order.customer_phone ?? '—'}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Email</td>
          <td style="padding:4px 0;color:#1a0f0a;">${order.customer_email ?? '—'}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Scheduled</td>
          <td style="padding:4px 0;color:#1a0f0a;font-weight:600;">${formatDate(order.scheduled_date)}${order.scheduled_time ? ` · ${order.scheduled_time}` : ''}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;vertical-align:top;">Address</td>
          <td style="padding:4px 0;color:#1a0f0a;">${fullAddress}</td>
        </tr>
        ${order.cake_message ? `
        <tr>
          <td style="padding:4px 0;color:#888;">Cake Message</td>
          <td style="padding:4px 0;color:#c9956a;font-style:italic;">"${order.cake_message}"</td>
        </tr>` : ''}
      </table>
    </div>

    <div style="padding:24px 28px;">
      <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;">Items to Prepare</p>
      <table style="width:100%;border-collapse:collapse;">
        ${adminItemRows}
        <tr>
          <td colspan="2" style="padding:12px 0 0;font-size:15px;font-weight:700;border-top:2px solid #eee;">Total</td>
          <td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:700;color:#c9956a;border-top:2px solid #eee;">RM ${Number(order.total).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="background:#f5f5f5;padding:16px 28px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#aaa;">Manage this order at blackcreme.com/admin</p>
    </div>

  </div>
</body>
</html>`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [adminEmail],
          subject: `🎂 New Order ${orderRef} — RM ${Number(order.total).toFixed(2)} · ${order.customer_name ?? 'Guest'}`,
          html: adminHtml,
        }),
      });

      console.log(`[send-order-email] Admin notification sent to ${adminEmail}`);
    }

    console.log(`[send-order-email] Email sent to ${order.customer_email} for order ${orderRef}`);

    return new Response(
      JSON.stringify({ sent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    console.error('[send-order-email]', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
