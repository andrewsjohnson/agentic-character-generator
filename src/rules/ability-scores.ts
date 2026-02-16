import type { AbilityScores, AbilityModifiers, AbilityBonuses } from '../types/ability';
import { ABILITY_NAMES } from '../types/ability';

/**
 * Calculate the ability modifier for a given ability score.
 * Formula: floor((score - 10) / 2)
 *
 * @param score - The ability score (any integer)
 * @returns The ability modifier
 *
 * @example
 * calculateModifier(10) // returns 0
 * calculateModifier(18) // returns 4
 * calculateModifier(8) // returns -1
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate ability modifiers for all six abilities.
 *
 * @param scores - A complete set of ability scores
 * @returns A record of all six ability modifiers
 *
 * @example
 * calculateAllModifiers({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 })
 * // returns { STR: 2, DEX: 2, CON: 1, INT: 1, WIS: 0, CHA: -1 }
 */
export function calculateAllModifiers(scores: AbilityScores): AbilityModifiers {
  const modifiers = {} as AbilityModifiers;

  for (const ability of ABILITY_NAMES) {
    modifiers[ability] = calculateModifier(scores[ability]);
  }

  return modifiers;
}
