import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_type,
      delivery_address_line_1,
      delivery_address_line_2,
      delivery_city,
      delivery_state,
      delivery_postcode,
      scheduled_date,
      scheduled_time,
      cake_message,
      subtotal,
      delivery_fee,
      total,
      user_id,
      items,
      origin,
    } = body;

    if (!customer_name || !customer_email || !items?.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customer_name, customer_email, items' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Generate order number: BC-YYMMDD-XXXX (Malaysia Time UTC+8)
    const mytOffset = 8 * 60 * 60 * 1000;
    const mytNow = new Date(Date.now() + mytOffset);
    const yy = String(mytNow.getUTCFullYear()).slice(2);
    const mm = String(mytNow.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(mytNow.getUTCDate()).padStart(2, '0');
    const dateStr = `${yy}${mm}${dd}`;

    const todayStart = new Date(Date.UTC(mytNow.getUTCFullYear(), mytNow.getUTCMonth(), mytNow.getUTCDate()) - mytOffset);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const { count: todayCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString());

    const order_number = `BC-${dateStr}-${String((todayCount ?? 0) + 1).padStart(4, '0')}`;

    // Insert order row
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        user_id: user_id ?? null,
        delivery_type,
        subtotal,
        delivery_fee: delivery_fee ?? 0,
        discount_amount: 0,
        total,
        cake_message: cake_message ?? null,
        scheduled_date,
        scheduled_time,
        status: 'pending',
        customer_name,
        customer_email,
        customer_phone,
        payment_gateway: 'stripe',
        delivery_address_line_1: delivery_address_line_1 ?? null,
        delivery_address_line_2: delivery_address_line_2 ?? null,
        delivery_city: delivery_city ?? null,
        delivery_state: delivery_state ?? null,
        delivery_postcode: delivery_postcode ?? null,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'Failed to create order');
    }

    // Insert order items
    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((item: { product_id: string; product_name: string; product_price: number; quantity: number; subtotal: number }) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    );

    if (itemsError) throw new Error(itemsError.message);

    // Build Stripe line items (amounts in sen — MYR cents)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: { product_name: string; product_price: number; quantity: number }) => ({
        price_data: {
          currency: 'myr',
          product_data: { name: item.product_name },
          unit_amount: Math.round(item.product_price * 100),
        },
        quantity: item.quantity,
      }),
    );

    if (delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: 'myr',
          product_data: { name: 'Delivery Fee' },
          unit_amount: Math.round(delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    const siteOrigin = origin ?? 'http://localhost:3000';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'],
      mode: 'payment',
      customer_email,
      line_items: lineItems,
      metadata: {
        order_id: order.id,
        order_number,
      },
      success_url: `${siteOrigin}/order-success?orderId=${order.id}`,
      cancel_url: `${siteOrigin}/?cancelled=true`,
    });

    // Save Stripe session details back to order
    await supabase
      .from('orders')
      .update({ payment_id: session.id, payment_url: session.url })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({ checkoutUrl: session.url, orderId: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[create-order]', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
