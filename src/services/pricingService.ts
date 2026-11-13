import { PricingConfig } from '../types';

const PRICING_STORAGE_KEY = 'sukasri_pricing_config_v1';

export const DEFAULT_PRICING: PricingConfig = {
  singleChapterPriceInr: 49,
  monthlyMembershipPriceInr: 19,
  singleChapterPriceUsd: 1.00,
  monthlyMembershipPriceUsd: 0.50,
  lastUpdated: new Date().toISOString()
};

// Listeners for dynamic reactive pricing across the entire application
type PricingListener = (config: PricingConfig) => void;
const listeners: Set<PricingListener> = new Set();

export const subscribeToPricing = (listener: PricingListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = (config: PricingConfig) => {
  listeners.forEach(fn => {
    try {
      fn(config);
    } catch (e) {
      console.error('Error notifying pricing listener:', e);
    }
  });
};

export const getPricingConfig = (): PricingConfig => {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PRICING };
    }
    const parsed = JSON.parse(raw);
    return {
      singleChapterPriceInr: typeof parsed.singleChapterPriceInr === 'number' ? parsed.singleChapterPriceInr : DEFAULT_PRICING.singleChapterPriceInr,
      monthlyMembershipPriceInr: typeof parsed.monthlyMembershipPriceInr === 'number' ? parsed.monthlyMembershipPriceInr : DEFAULT_PRICING.monthlyMembershipPriceInr,
      singleChapterPriceUsd: typeof parsed.singleChapterPriceUsd === 'number' ? parsed.singleChapterPriceUsd : DEFAULT_PRICING.singleChapterPriceUsd,
      monthlyMembershipPriceUsd: typeof parsed.monthlyMembershipPriceUsd === 'number' ? parsed.monthlyMembershipPriceUsd : DEFAULT_PRICING.monthlyMembershipPriceUsd,
      lastUpdated: parsed.lastUpdated || new Date().toISOString()
    };
  } catch {
    return { ...DEFAULT_PRICING };
  }
};

export const updatePricingConfig = (newPrices: Partial<PricingConfig>): PricingConfig => {
  const current = getPricingConfig();
  const updated: PricingConfig = {
    ...current,
    ...newPrices,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(updated));
  notifyListeners(updated);
  return updated;
};

/**
 * Exchanges the 2 prices:
 * Single Chapter (₹49) <-> VIP Monthly (₹19)
 */
export const exchangePrices = (): PricingConfig => {
  const current = getPricingConfig();
  const updated: PricingConfig = {
    singleChapterPriceInr: current.monthlyMembershipPriceInr,
    monthlyMembershipPriceInr: current.singleChapterPriceInr,
    singleChapterPriceUsd: current.monthlyMembershipPriceUsd,
    monthlyMembershipPriceUsd: current.singleChapterPriceUsd,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(updated));
  notifyListeners(updated);
  return updated;
};

export const resetPricingToDefaults = (): PricingConfig => {
  const fresh = { ...DEFAULT_PRICING, lastUpdated: new Date().toISOString() };
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(fresh));
  notifyListeners(fresh);
  return fresh;
};
