import posthog from 'posthog-js';

/**
 * Typed map of every event this app can emit, along with the properties
 * required for each one. Add new events here when you instrument new
 * interactions — TypeScript will enforce that callers pass the right shape.
 */
type EventMap = {
  /** User clicked "Create New Character" on the Start page. */
  character_started: { method: 'new' };

  /** User successfully imported a character from a JSON file. */
  character_imported: { enabled_pack_count: number };

  /** User attempted a JSON import but it failed. */
  character_import_failed: { reason: string };

  /** User selected a species (or changed their selection). */
  species_selected: { species: string; source: string; has_subspecies: boolean };

  /** User selected a subspecies. */
  subspecies_selected: { species: string; subspecies: string };

  /** User selected a class (or changed their selection). */
  class_selected: { class: string; source: string };

  /**
   * User switched ability score methods.
   * Fires when the tab changes, not when individual scores are adjusted.
   */
  ability_score_method_selected: { method: 'point-buy' | 'standard-array' };

  /** User selected a background (or changed their selection). */
  background_selected: { background: string };

  /**
   * User advanced past a step by clicking Next and passing validation.
   * step_index is 0-based across the full STEPS array.
   */
  step_completed: { from_step: string; to_step: string; step_index: number };

  /**
   * User clicked Next but the current step failed validation.
   * Useful for spotting which steps cause the most friction.
   */
  step_validation_failed: { step: string; errors: string[] };

  /** User downloaded the finished character sheet. */
  character_exported: { format: 'pdf' | 'json' };

  /** User toggled an expansion pack on or off. */
  expansion_pack_toggled: { pack_id: string; pack_name: string; enabled: boolean };
};

/**
 * Initialise PostHog. Call once at app startup (main.tsx).
 *
 * Requires the environment variable VITE_POSTHOG_KEY to be set.
 * Optionally, VITE_POSTHOG_HOST overrides the default ingest host
 * (useful for self-hosted PostHog or the EU cloud).
 *
 * If the key is absent the function is a no-op, so local development
 * without credentials works without errors.
 */
export function initAnalytics(): void {
  const key = import.meta.env['VITE_POSTHOG_KEY'] as string | undefined;
  if (!key) return;

  const host =
    (import.meta.env['VITE_POSTHOG_HOST'] as string | undefined) ??
    'https://us.i.posthog.com';

  posthog.init(key, {
    api_host: host,
    // Capture page views automatically — gives us the wizard funnel for free.
    capture_pageview: true,
    // Track when the user leaves a page, so we can compute time-on-step.
    capture_pageleave: true,
    // Opt out of PostHog's auto-capture of clicks/inputs. We instrument
    // explicit events instead to keep data clean and avoid accidentally
    // capturing sensitive text inputs (ability scores, character names).
    autocapture: false,
  });
}

/**
 * Emit a typed analytics event.
 *
 * If analytics has not been initialised (key missing) PostHog is a no-op
 * so this is always safe to call.
 */
export function capture<E extends keyof EventMap>(
  event: E,
  properties: EventMap[E],
): void {
  posthog.capture(event, properties as Record<string, unknown>);
}
