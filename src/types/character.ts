import type { AbilityScores, AbilityBonuses, AbilityModifiers } from "./ability";
import type { RaceSelection } from "./race";
import type { ClassSelection } from "./class";
import type { BackgroundSelection } from "./background";
import type { Inventory } from "./equipment";

/**
 * Alignment options per the 5e SRD.
 */
export type Alignment =
  | "Lawful Good"
  | "Neutral Good"
  | "Chaotic Good"
  | "Lawful Neutral"
  | "True Neutral"
  | "Chaotic Neutral"
  | "Lawful Evil"
  | "Neutral Evil"
  | "Chaotic Evil";

/**
 * A work-in-progress character draft. Every field is optional so the
 * object can be built up incrementally as the player makes choices.
 *
 * Fields marked @derived should be computed at read time, not persisted.
 */
export type CharacterDraft = {
  name?: string;
  alignment?: Alignment;

  /** Base ability scores before racial bonuses are applied. */
  baseAbilityScores?: AbilityScores;

  /**
   * @derived Aggregate all racial and other ability bonuses from the
   * selected race/subrace. Compute from `raceSelection`, not stored.
   */
  abilityBonuses?: AbilityBonuses;

  /**
   * @derived Compute each modifier as `Math.floor((finalScore - 10) / 2)`
   * where `finalScore = baseAbilityScores[ability] + abilityBonuses[ability]`.
   * Do not store; always derive from current scores and bonuses.
   */
  abilityModifiers?: AbilityModifiers;

  raceSelection?: RaceSelection;
  classSelection?: ClassSelection;
  backgroundSelection?: BackgroundSelection;

  /**
   * @derived Compute as class hit die max + Constitution modifier at 1st
   * level. Do not store; derive from class selection and ability scores.
   */
  maxHitPoints?: number;

  /**
   * @derived Compute as 10 + Dexterity modifier (before armor). With armor,
   * derive from equipped armor's formula. Do not store; derive at read time.
   */
  armorClass?: number;

  /**
   * @derived Compute as Dexterity modifier (plus proficiency bonus if
   * proficient). Do not store; derive from ability scores and proficiencies.
   */
  initiative?: number;

  /**
   * @derived Equals the speed value from the selected race. Do not store
   * separately; read from `raceSelection.race.speed`.
   */
  speed?: number;

  /**
   * @derived Computed from class level using the proficiency bonus table.
   * Do not store; derive from `classSelection.level`.
   */
  proficiencyBonus?: number;

  inventory?: Inventory;

  /** Free-form character notes the player may add at any point. */
  notes?: string;
};
