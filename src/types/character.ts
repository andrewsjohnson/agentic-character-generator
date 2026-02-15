import type { AbilityScores, AbilityScoreMethod } from './ability';
import type { Race, Subrace } from './race';
import type { CharacterClass, Subclass } from './class';
import type { Background } from './background';
import type { EquipmentItem } from './equipment';

/**
 * The top-level character draft. Represents a work-in-progress character
 * being built through the wizard steps.
 *
 * Optional fields indicate steps that haven't been completed yet.
 * Derived values (AC, HP, spell save DC, ability modifiers) are NOT
 * stored here — compute them at read time using functions from rules/.
 */
export type CharacterDraft = {
  name?: string;

  /** The chosen race. */
  race?: Race;

  /** The chosen subrace, if the selected race has subraces. */
  subrace?: Subrace;

  /** The chosen class. */
  class?: CharacterClass;

  /** The chosen subclass, if selected. */
  subclass?: Subclass;

  /** The chosen background. */
  background?: Background;

  /** The method used to determine ability scores. */
  abilityScoreMethod?: AbilityScoreMethod;

  /** Base ability scores before racial bonuses. */
  baseAbilityScores?: AbilityScores;

  /**
   * Final ability scores after racial bonuses are applied.
   * Derived from baseAbilityScores + race/subrace bonuses.
   * Should be computed, not stored.
   */

  /** The level of the character. Defaults to 1 for new characters. */
  level?: number;

  /** Skill proficiencies chosen by the player (from class + background). */
  skillProficiencies?: string[];

  /** Equipment selected during character creation. */
  equipment?: EquipmentItem[];

  /** Personality trait chosen from background options. */
  personalityTrait?: string;

  /** Ideal chosen from background options. */
  ideal?: string;

  /** Bond chosen from background options. */
  bond?: string;

  /** Flaw chosen from background options. */
  flaw?: string;

  /**
   * Hit points. Derived at level 1 as hitDie max + CON modifier.
   * Should be computed, not stored.
   */

  /**
   * Armor class. Derived from equipped armor + DEX modifier.
   * Should be computed, not stored.
   */

  /**
   * Proficiency bonus. Derived from level.
   * Should be computed, not stored.
   */
};
