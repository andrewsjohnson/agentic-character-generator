import type { AbilityScores, AbilityScoreMethod } from './ability';
import type { Species, Subspecies } from './species';
import type { CharacterClass, Subclass } from './class';
import type { Background } from './background';
import type { EquipmentItem } from './equipment';
import type { SkillName } from './skill';

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

  /** The character's alignment (e.g. "Lawful Good", "Chaotic Neutral"). */
  alignment?: string;

  /** The chosen species. */
  species?: Species;

  /** The chosen subspecies, if the selected species has subspecies. */
  subspecies?: Subspecies;

  /** The chosen class. */
  class?: CharacterClass;

  /** The chosen subclass, if selected. */
  subclass?: Subclass;

  /** The chosen background. */
  background?: Background;

  /** The method used to determine ability scores. */
  abilityScoreMethod?: AbilityScoreMethod;

  /** Base ability scores before background bonuses. */
  baseAbilityScores?: AbilityScores;

  /** Origin feat selected from background options. */
  originFeat?: string;

  /** The level of the character. Defaults to 1 for new characters. */
  level?: number;

  /** Skill proficiencies chosen by the player (from class + background). */
  skillProficiencies?: SkillName[];

  /** Equipment selected during character creation. */
  equipment?: EquipmentItem[];

  /** Cantrips chosen by the player (spell names from the class spell list). */
  cantripsKnown?: string[];

  /** Level-1 spells chosen by the player (prepared or known, depending on class). */
  spellsKnown?: string[];

  /** Languages chosen by the player (from species options or background). */
  selectedLanguages?: string[];

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
