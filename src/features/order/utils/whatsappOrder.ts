import { BAKERY_INFO } from '@/data/deliveryZones';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderSummary {
  customer: {
    name: string;
    whatsapp: string;
  };
  delivery: {
    type: 'delivery' | 'pickup';
    addressLine1: string;
    addressLine2: string;
    postcode: string;
    city: string;
    state: string;
    zone: string;
    fee: number;
    estimatedTime: string;
  };
  cake: {
    name: string;
    size: string;
    flavour: string;
    message: string;
    quantity: number;
    unitPrice: number;
  };
  order: {
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: string;
    preferredDate: string;
    preferredTimeSlot: string;
    notes: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIV = '─────────────────────';

function rm(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

function formatAddress(d: OrderSummary['delivery']): string {
  const parts = [d.addressLine1];
  if (d.addressLine2?.trim()) parts.push(d.addressLine2.trim());
  parts.push(`${d.postcode} ${d.city}, ${d.state}`);
  return parts.join(', ');
}

// ─── Core builder ─────────────────────────────────────────────────────────────

export function buildWhatsAppMessage(order: OrderSummary): string {
  const { customer, delivery, cake, order: o } = order;

  const deliveryLine =
    delivery.type === 'pickup'
      ? '🏪 Self Pickup (Free)'
      : `🚗 ${delivery.zone} | ETA: ${delivery.estimatedTime}`;

  const cakeLine = `🎂 ${cake.name} (${cake.size}, ${cake.flavour}) x${cake.quantity}`;

  const lines: string[] = [
    `🎂 NEW CAKE ORDER – ${BAKERY_INFO.name}`,
    DIV,
    `👤 ${customer.name} | 📞 ${customer.whatsapp}`,
    `📍 ${formatAddress(delivery)}`,
    deliveryLine,
    DIV,
    cakeLine,
  ];

  if (cake.message?.trim()) {
    lines.push(`✉️  Cake message: "${cake.message.trim()}"`);
  }

  lines.push(
    DIV,
    `📅 ${o.preferredDate} | ⏰ ${o.preferredTimeSlot}`,
    `💰 Subtotal : ${rm(o.subtotal)}`,
    `🚗 Delivery : ${rm(o.deliveryFee)}`,
    `💳 TOTAL    : ${rm(o.total)}`,
    `💵 Payment  : ${o.paymentMethod}`,
  );

  if (o.notes?.trim()) {
    lines.push(`📝 Notes    : ${o.notes.trim()}`);
  }

  lines.push(DIV, 'Order placed via website');

  return lines.join('\n');
}

// ─── Sender ───────────────────────────────────────────────────────────────────

export function sendWhatsAppOrder(order: OrderSummary): void {
  const message = buildWhatsAppMessage(order);
  const url = `https://wa.me/${BAKERY_INFO.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
