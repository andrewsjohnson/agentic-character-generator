/**
 * The six core ability scores as defined in the 5e SRD.
 */
export type AbilityName =
  | "Strength"
  | "Dexterity"
  | "Constitution"
  | "Intelligence"
  | "Wisdom"
  | "Charisma";

/**
 * A complete set of raw ability scores (values typically range from 1–20
 * for player characters before racial bonuses).
 */
export type AbilityScores = Record<AbilityName, number>;

/**
 * Racial or other flat bonuses applied to ability scores.
 * Not every ability needs a bonus, so the record is partial.
 */
export type AbilityBonuses = Partial<Record<AbilityName, number>>;

/**
 * Ability modifiers derived from final ability scores.
 *
 * /** @derived Compute as `Math.floor((score - 10) / 2)` — do not store
 * independently; always recalculate from the current ability scores.
 */
export type AbilityModifiers = Record<AbilityName, number>;

/**
 * Snapshot of a single ability: its base score, any bonus applied, and the
 * resulting modifier.
 */
export type AbilityDetail = {
  base: number;
  bonus: number;
  /**
   * @derived Compute as `Math.floor((base + bonus - 10) / 2)`.
   * Should be computed from `base` and `bonus`, not stored separately.
   */
  modifier: number;
};

/**
 * Full ability-score block for a character, keyed by ability name.
 */
export type AbilityBlock = Record<AbilityName, AbilityDetail>;
