import { useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  POSTCODE_LOOKUP,
  getDeliveryFee,
  isServiceablePostcode,
  type DeliveryInfo,
} from '@/data/deliveryZones';

// ─── Re-export the postcode map for parent use ────────────────────────────────
export { POSTCODE_LOOKUP };

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AddressFormValues {
  recipientName: string;
  whatsappNumber: string;
  addressLine1: string;
  addressLine2: string;
  postcode: string;
  city: string;
  state: string;
  deliveryType: 'delivery' | 'self_pickup';
}

interface AddressFormProps {
  onSubmit: (values: AddressFormValues & { deliveryFee: number }) => void;
  onCancel?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MY_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Wilayah Persekutuan Kuala Lumpur',
  'Wilayah Persekutuan Labuan',
  'Wilayah Persekutuan Putrajaya',
];

// ─── Zod schemas (re-used as validator functions via .safeParse) ──────────────
const nameSchema       = z.string().min(1, 'Name is required');
const waSchema         = z.string()
  .min(1, 'WhatsApp number is required')
  .regex(/^01\d-\d{7,8}$/, 'Format: 01X-XXXXXXXX');
const postcodeSchema   = z.string().regex(/^\d{5}$/, 'Postcode must be exactly 5 digits');
const requiredStr      = z.string().min(1, 'This field is required');

function zodMsg(schema: z.ZodTypeAny, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  if (!result.success) return result.error.issues[0].message;
  return undefined;
}

// ─── Helper: inline field error ───────────────────────────────────────────────
function FieldError({ errors }: { errors: (string | undefined)[] }) {
  const msg = errors.find(Boolean);
  if (!msg) return null;
  return <p className="mt-1 text-[11px] text-red-500">{msg}</p>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AddressForm({ onSubmit, onCancel }: AddressFormProps) {
  const [zoneStatus, setZoneStatus] = useState<
    | { type: 'idle' }
    | { type: 'serviceable'; info: DeliveryInfo }
    | { type: 'outside' }
  >({ type: 'idle' });

  const form = useForm({
    defaultValues: {
      recipientName: '',
      whatsappNumber: '',
      addressLine1: '',
      addressLine2: '',
      postcode: '',
      city: '',
      state: '',
      deliveryType: 'delivery' as 'delivery' | 'self_pickup',
    },
    onSubmit: async ({ value }) => {
      const isDelivery = value.deliveryType === 'delivery';
      const deliveryFee = isDelivery
        ? (getDeliveryFee(value.postcode)?.fee ?? 0)
        : 0;
      onSubmit({ ...value, deliveryFee });
    },
  });

  const deliveryType = useStore(form.store, (s) => s.values.deliveryType);
  const isDelivery   = deliveryType === 'delivery';

  const handlePostcodeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 5);
    form.setFieldValue('postcode', digits);

    if (digits.length < 5) {
      setZoneStatus({ type: 'idle' });
      return;
    }
    if (!isServiceablePostcode(digits)) {
      setZoneStatus({ type: 'outside' });
      return;
    }
    const entry = POSTCODE_LOOKUP[digits];
    const info  = getDeliveryFee(digits)!;
    setZoneStatus({ type: 'serviceable', info });
    form.setFieldValue('city', entry.city);
    form.setFieldValue('state', entry.state);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      {/* ── Delivery type toggle ─────────────────────────────────────── */}
      <div>
        <Label>Delivery Method</Label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['delivery', 'self_pickup'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                form.setFieldValue('deliveryType', type);
                if (type === 'self_pickup') setZoneStatus({ type: 'idle' });
              }}
              className={[
                'flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all',
                deliveryType === type
                  ? 'bg-primary-dark text-white'
                  : 'bg-white text-gray-soft hover:bg-primary-cream',
              ].join(' ')}
            >
              {type === 'delivery' ? '🚗 Delivery' : '🏪 Self Pickup'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Recipient name ───────────────────────────────────────────── */}
      <form.Field
        name="recipientName"
        validators={{ onBlur: ({ value }) => zodMsg(nameSchema, value) }}
      >
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Recipient Name *</Label>
            <Input
              id={field.name}
              placeholder="e.g. Sarah Lim"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && (
              <FieldError errors={field.state.meta.errors as string[]} />
            )}
          </div>
        )}
      </form.Field>

      {/* ── WhatsApp number ──────────────────────────────────────────── */}
      <form.Field
        name="whatsappNumber"
        validators={{ onBlur: ({ value }) => zodMsg(waSchema, value) }}
      >
        {(field) => (
          <div>
            <Label htmlFor={field.name}>WhatsApp Number *</Label>
            <Input
              id={field.name}
              type="tel"
              placeholder="e.g. 012-3456789"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && (
              <FieldError errors={field.state.meta.errors as string[]} />
            )}
          </div>
        )}
      </form.Field>

      {/* ── Address fields (hidden for self pickup) ──────────────────── */}
      {isDelivery && (
        <div className="space-y-5">
          {/* Street / house no. */}
          <form.Field
            name="addressLine1"
            validators={{
              onBlur: ({ value }) => zodMsg(requiredStr, value),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Address Line 1 *</Label>
                <Input
                  id={field.name}
                  placeholder="e.g. No. 5, Jalan SS2/24"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && (
                  <FieldError errors={field.state.meta.errors as string[]} />
                )}
              </div>
            )}
          </form.Field>

          {/* Unit / floor / block (optional) */}
          <form.Field name="addressLine2">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>
                  Address Line 2{' '}
                  <span className="normal-case font-normal opacity-50">(optional)</span>
                </Label>
                <Input
                  id={field.name}
                  placeholder="e.g. Unit 3A, Residensi Vista"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {/* Postcode with auto-fill ───────────────────────────────── */}
          <form.Field
            name="postcode"
            validators={{
              onChange: ({ value }) =>
                value.length === 5 && !isServiceablePostcode(value)
                  ? 'Sorry, outside delivery area'
                  : undefined,
              onBlur: ({ value }) => zodMsg(postcodeSchema, value),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Postcode *</Label>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 47300"
                  value={field.state.value}
                  onChange={(e) => handlePostcodeChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {/* Zone badge — serviceable */}
                {zoneStatus.type === 'serviceable' && (
                  <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {zoneStatus.info.label}
                  </span>
                )}
                {/* Zone badge — outside area */}
                {zoneStatus.type === 'outside' && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    Sorry, outside delivery area
                  </p>
                )}
                {/* Fallback Zod error when no zone badge */}
                {zoneStatus.type === 'idle' && field.state.meta.isTouched && (
                  <FieldError errors={field.state.meta.errors as string[]} />
                )}
              </div>
            )}
          </form.Field>

          {/* City (auto-filled) */}
          <form.Field
            name="city"
            validators={{ onBlur: ({ value }) => zodMsg(requiredStr, value) }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>City *</Label>
                <Input
                  id={field.name}
                  placeholder="Auto-filled from postcode"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && (
                  <FieldError errors={field.state.meta.errors as string[]} />
                )}
              </div>
            )}
          </form.Field>

          {/* State dropdown (auto-filled) */}
          <form.Field
            name="state"
            validators={{
              onBlur: ({ value }) =>
                !value ? 'State is required' : undefined,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>State *</Label>
                <Select
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                >
                  <option value="">— Select state —</option>
                  {MY_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                {field.state.meta.isTouched && (
                  <FieldError errors={field.state.meta.errors as string[]} />
                )}
              </div>
            )}
          </form.Field>
        </div>
      )}

      {/* ── Self pickup notice ───────────────────────────────────────── */}
      {!isDelivery && (
        <div className="rounded-xl bg-primary-cream border border-accent-caramel/30 px-4 py-3 text-sm text-primary-dark/70">
          🏪 You've selected <strong className="text-primary-dark">Self Pickup</strong>.
          No delivery fee. Our team will contact you to arrange a pickup time.
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 border border-primary-dark/20 text-primary-dark text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || zoneStatus.type === 'outside'}
              className="flex-[2] py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing…' : 'Continue →'}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
