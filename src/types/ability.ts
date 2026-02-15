/** The six core ability scores in D&D 5e. */
export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

/** All six ability names as a runtime array, matching the AbilityName union. */
export const ABILITY_NAMES: readonly AbilityName[] = [
  'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA',
] as const;

/** A complete set of base ability scores (before racial bonuses). */
export type AbilityScores = Record<AbilityName, number>;

/**
 * Partial ability score bonuses, e.g. racial bonuses that only affect
 * some abilities.
 */
export type AbilityBonuses = Partial<Record<AbilityName, number>>;

/**
 * Ability score modifiers — derived as Math.floor((score - 10) / 2).
 * These should be computed at read time, never stored in state.
 */
export type AbilityModifiers = Record<AbilityName, number>;

/** The method used to generate ability scores. */
export type AbilityScoreMethod = 'standard-array' | 'point-buy' | 'manual';
