import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const body = await req.text();

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature or STRIPE_WEBHOOK_SECRET' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-06-20',
  });

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('[stripe-webhook] Signature error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      console.error('[stripe-webhook] No order_id in session metadata');
      return new Response(
        JSON.stringify({ error: 'No order_id in metadata' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Mark order as paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_id: session.id,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[stripe-webhook] Failed to update order:', updateError.message);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Fetch full order + items to send email
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (order) {
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({ order }),
        });
      } catch (emailErr) {
        // Log but don't fail — payment already confirmed
        console.error('[stripe-webhook] Email send failed:', emailErr);
      }
    }

    console.log(`[stripe-webhook] Order ${orderId} marked as paid`);
  }

  return new Response(
    JSON.stringify({ received: true }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
