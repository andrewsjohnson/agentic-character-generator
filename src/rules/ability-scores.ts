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

/**
 * Get the point buy cost for a single ability score.
 * Valid score range is 8-15. Scores outside this range return -1.
 *
 * @param score - The ability score to get the cost for
 * @returns The point cost, or -1 if the score is invalid
 *
 * @example
 * getPointBuyCost(8) // returns 0
 * getPointBuyCost(14) // returns 7
 * getPointBuyCost(15) // returns 9
 * getPointBuyCost(16) // returns -1 (invalid)
 */
export function getPointBuyCost(score: number): number {
  const costTable: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
  };

  return costTable[score] ?? -1;
}

/**
 * Calculate the total points spent on a set of ability scores using point buy.
 * Returns the sum of all individual costs. If any score is invalid, the total
 * will be negative.
 *
 * @param scores - A complete set of ability scores
 * @returns The total points spent (may be negative if any invalid scores)
 *
 * @example
 * getTotalPointsSpent({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }) // returns 0
 * getTotalPointsSpent({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }) // returns 27
 */
export function getTotalPointsSpent(scores: AbilityScores): number {
  let total = 0;

  for (const ability of ABILITY_NAMES) {
    total += getPointBuyCost(scores[ability]);
  }

  return total;
}

/**
 * Check if a set of ability scores is valid under the point buy system.
 * All scores must be in the 8-15 range and the total cost must not exceed the budget.
 *
 * @param scores - A complete set of ability scores
 * @param budget - The point buy budget (default: 27)
 * @returns True if the scores are valid, false otherwise
 *
 * @example
 * isValidPointBuy({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }) // returns true
 * isValidPointBuy({ STR: 15, DEX: 15, CON: 15, INT: 15, WIS: 15, CHA: 15 }) // returns false (over budget)
 * isValidPointBuy({ STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }) // returns false (score out of range)
 */
export function isValidPointBuy(scores: AbilityScores, budget = 27): boolean {
  // Check if all scores are in valid range (8-15)
  for (const ability of ABILITY_NAMES) {
    const score = scores[ability];
    if (score < 8 || score > 15) {
      return false;
    }
  }

  // Check if total cost is within budget
  const totalSpent = getTotalPointsSpent(scores);
  return totalSpent >= 0 && totalSpent <= budget;
}

/**
 * Apply species ability bonuses to a set of base ability scores.
 * Caps each final score at 20 (the standard D&D 5e maximum).
 *
 * @param baseScores - The base ability scores before species bonuses
 * @param bonuses - The species ability bonuses (may be partial)
 * @returns A new AbilityScores object with bonuses applied and capped at 20
 *
 * @example
 * applySpeciesBonuses(
 *   { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
 *   { STR: 2, CON: 1 }
 * )
 * // returns { STR: 17, DEX: 14, CON: 14, INT: 12, WIS: 10, CHA: 8 }
 *
 * @example
 * // Capping at 20
 * applySpeciesBonuses(
 *   { STR: 19, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
 *   { STR: 2 }
 * )
 * // returns { STR: 20, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
 */
export function applySpeciesBonuses(
  baseScores: AbilityScores,
  bonuses: AbilityBonuses
): AbilityScores {
  const result = {} as AbilityScores;

  for (const ability of ABILITY_NAMES) {
    const base = baseScores[ability];
    const bonus = bonuses[ability] ?? 0;
    const total = base + bonus;

    // Cap at 20 (D&D 5e standard maximum)
    result[ability] = Math.min(total, 20);
  }

  return result;
}

/**
 * Get the standard array of ability scores.
 * These are: 15, 14, 13, 12, 10, 8
 *
 * @returns The standard array as a number array
 */
export function getStandardArray(): number[] {
  return [15, 14, 13, 12, 10, 8];
}

/**
 * Check if a set of ability scores matches the standard array.
 * The order doesn't matter - only that the six values match.
 *
 * @param scores - A complete set of ability scores
 * @returns True if the scores match the standard array (in any order)
 *
 * @example
 * isValidStandardArray({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }) // returns true
 * isValidStandardArray({ STR: 8, DEX: 10, CON: 12, INT: 13, WIS: 14, CHA: 15 }) // returns true
 * isValidStandardArray({ STR: 15, DEX: 15, CON: 13, INT: 12, WIS: 10, CHA: 8 }) // returns false
 */
export function isValidStandardArray(scores: AbilityScores): boolean {
  // Extract the six values from the scores object
  const values = ABILITY_NAMES.map((ability) => scores[ability]);

  // Sort both arrays for comparison
  const sortedValues = [...values].sort((a, b) => a - b);
  const sortedStandard = [...getStandardArray()].sort((a, b) => a - b);

  // Check if they match exactly
  return sortedValues.every((value, index) => value === sortedStandard[index]);
}
