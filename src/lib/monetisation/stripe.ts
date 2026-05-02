// src/lib/monetisation/stripe.ts
import 'server-only';
import { Redis }   from '@upstash/redis';
import type Stripe from 'stripe';

const STRIPE_SECRET_KEY     = process.env.STRIPE_SECRET_KEY ?? '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';
const BASE_URL              = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com';
const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const PRICE_IDS = {
  pro_monthly:  process.env.STRIPE_PRO_MONTHLY_PRICE_ID  ?? '',
  pro_yearly:   process.env.STRIPE_PRO_YEARLY_PRICE_ID   ?? '',
} as const;

export type PricePlan = keyof typeof PRICE_IDS;
export type SubscriptionTier   = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface UserSubscription {
  userId:         string;
  tier:           SubscriptionTier;
  status:         SubscriptionStatus;
  customerId:     string;
  subscriptionId: string;
  priceId:        string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd:boolean;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url:       string;
}

export interface PortalSessionResult {
  url: string;
}

const SUB_KEY_PREFIX   = 'sub:';
const SUB_TTL_SECONDS  = 60 * 60 * 24;
const IDEMPOTENCY_PREFIX = 'stripe:event:';

function subKey(userId: string): string {
  return SUB_KEY_PREFIX + userId;
}

let _Stripe: Stripe | null = null;

async function getStripe(): Promise<Stripe> {
  if (_Stripe) return _Stripe;
  try {
    const mod = await import('stripe');
    const StripeConstructor = mod.default ?? mod;
    _Stripe = new StripeConstructor(STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' }) as Stripe;
    return _Stripe;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Stripe is not available: ${message}. Please run 'npm install stripe' and ensure it's in your deployment.`);
  }
}

export class SubscriptionStore {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  async get(userId: string): Promise<UserSubscription | null> {
    return this.redis.get<UserSubscription>(subKey(userId));
  }

  async set(sub: UserSubscription): Promise<void> {
    await this.redis.set(subKey(sub.userId), sub, { ex: SUB_TTL_SECONDS });
  }

  async isProOrAbove(userId: string): Promise<boolean> {
    const sub = await this.get(userId);
    if (!sub) return false;
    return (
      (sub.tier === 'pro' || sub.tier === 'team') &&
      (sub.status === 'active' || sub.status === 'trialing')
    );
  }

  async findByCustomerId(customerId: string): Promise<UserSubscription | null> {
    const keys = await this.redis.keys(`${SUB_KEY_PREFIX}*`);
    for (const key of keys) {
      const sub = await this.redis.get<UserSubscription>(key);
      if (sub?.customerId === customerId) return sub;
    }
    return null;
  }
}

/**
 * Check whether a Stripe event ID has already been processed.
 * Uses Redis SET NX (only succeeds if key does not exist) with TTL.
 * Returns true if the event was already processed (duplicate).
 */
async function isDuplicateEvent(eventId: string): Promise<boolean> {
  const redis = Redis.fromEnv();
  const key    = IDEMPOTENCY_PREFIX + eventId;
  // SET NX returns null if key already exists, 'OK' if newly set
  const result = await redis.set(key, new Date().toISOString(), {
    nx: true,
    ex: IDEMPOTENCY_TTL_SECONDS,
  });
  return result !== 'OK'; // true = duplicate, false = new
}

export async function createCheckoutSession(
  userId:    string,
  userEmail: string,
  plan:      PricePlan,
): Promise<CheckoutSessionResult> {
  const stripe  = await getStripe();
  const priceId = PRICE_IDS[plan];
  if (!priceId) throw new Error(`Price ID not configured for plan: ${plan}`);

  const session = await stripe.checkout.sessions.create({
    mode:                'subscription',
    customer_email:      userEmail,
    line_items:          [{ price: priceId, quantity: 1 }],
    success_url:         `${BASE_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:          `${BASE_URL}/pro?cancelled=true`,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata:          { userId },
    },
    metadata: { userId, plan },
    client_reference_id: userId,
  });

  return { sessionId: session.id, url: session.url ?? '' };
}

export async function createPortalSession(
  userId: string,
): Promise<PortalSessionResult> {
  const stripe = await getStripe();
  const store  = new SubscriptionStore();
  const sub    = await store.get(userId);

  if (!sub?.customerId) {
    throw new Error(`No Stripe customer found for user ${userId}`);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer:   sub.customerId,
    return_url: `${BASE_URL}/pro`,
  });

  return { url: session.url };
}

function tierFromPriceId(priceId: string): SubscriptionTier {
  if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_yearly) return 'pro';
  return 'free';
}

function mapStripeStatus(status: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active:             'active',
    trialing:           'trialing',
    past_due:           'past_due',
    canceled:           'canceled',
    incomplete:         'incomplete',
    incomplete_expired: 'canceled',
    unpaid:             'past_due',
    paused:             'canceled',
  };
  return map[status] ?? 'canceled';
}

export async function handleWebhookEvent(
  rawBody:   string,
  signature: string,
): Promise<{ handled: boolean; event: string }> {
  const stripe = await getStripe();
  const store  = new SubscriptionStore();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new Error('Invalid Stripe webhook signature');
  }

  // ── Idempotency: skip duplicate events ──────────────────────────────────
  const eventId = event.id as string;
  if (await isDuplicateEvent(eventId)) {
    console.info(`[stripe] Duplicate event skipped: ${eventId} (${event.type})`);
    return { handled: false, event: event.type };
  }

  const HANDLED_EVENTS = new Set([
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'checkout.session.completed',
  ]);

  if (!HANDLED_EVENTS.has(event.type)) {
    return { handled: false, event: event.type };
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object;
    const userId       = subscription.metadata['userId'] ?? '';
    if (!userId) return { handled: false, event: event.type };

    const priceId = subscription.items.data[0]?.price.id ?? '';
    const periodEnd = subscription.items?.data?.[0]?.current_period_end ?? Math.floor(Date.now() / 1000);

    await store.set({
      userId,
      tier:             event.type === 'customer.subscription.deleted' ? 'free' : tierFromPriceId(priceId),
      status:           mapStripeStatus(subscription.status),
      customerId:       subscription.customer as string,
      subscriptionId:   subscription.id,
      priceId,
      currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId     = session.metadata?.['userId'] ?? session.client_reference_id ?? '';
    const customerId = session.customer as string;
    if (userId && customerId) {
      const existing = await store.get(userId);
      if (!existing) {
        await store.set({
          userId,
          tier:             'free',
          status:           'incomplete',
          customerId,
          subscriptionId:   '',
          priceId:          '',
          currentPeriodEnd: new Date().toISOString(),
          cancelAtPeriodEnd: false,
        });
      }
    }
  }

  return { handled: true, event: event.type };
}

export const subscriptionStore = new SubscriptionStore();